/*global define:false*/
define(['views/common/baseModalView',
        'models/data/signOff',
        'collections/data/meaning',
        'models/data/meaning',
        'hb!templates/data/sign-off.html',
        'hb!templates/common/confirm-modal-footer.html']
    .concat('bootstrap'),

    function(BaseModalView,
    		SignOffModel,
    		Meaning,
    		MeaningModel,
    		bodyTemplate,
    		footerTemplate) {
        'use strict';
        var SignOffView = BaseModalView.extend({

            _options: function() {
    			return {
    				bodyTemplate: bodyTemplate,
    				headerKey: 'data.signoff.electricsign',
    				modalOptions : {
                        backdrop: 'static',
                        attentionAnimation: null,
                        keyboard: false,
                        show : true
                    }
    			}
    		},
    		
            initialize: function(options) {
                options = options || {};
                this.resultId = options.resultId;
                this.meaning = new Meaning;
                this.model = new SignOffModel();
                BaseModalView.prototype.initialize.call(this, options);
            },
             


            render: function() {
            	BaseModalView.prototype.render.call(this);
                this.$('#modalFooter').html(footerTemplate({
                	confirmClass: 'btn-primary',
                	cancelClass: 'btn-default',
                	cancelKey: 'dialog.cancel',
                	confirmKey: 'finalReportSection.SignOffSection',
                	confirmId: 'signOffButton',
                }));
                return this;
            },
            
            events: {
                'click #signOffButton' : 'exportPDF'
            },
            
            delegateEvents: function() {
    			BaseModalView.prototype.delegateEvents.apply(this, arguments);
                this.$el.on('hidden', _.bind(this.onHide, this));
            },
            
            exportPDF: function(e) {
            	e.preventDefault();
            	var self = this;
                var buttonWasDisabled = this.disableButton();
                if (buttonWasDisabled) {
	            	 this.model.set('userName', $("#signOffUserName").val());
	                 this.model.set('password', $("#signOffPassword").val());
	                 this.model.set('comment', $("#signOffComments").val());
	                 this.model.set('meaning', $("#signOffSignatureMeaning").val());
	                 this.model.set('resultId', this.resultId);
	                 this.model.set('reportMode', 'Approved');
					 if(this.options.installTemplateReport){
					     this.model.set('installTemplateReport', this.options.installTemplateReport);
					 }
					 this.model.save(this.model.toJSON(), {
	                     success: _.bind(this._onSaveSuccess, this),
						 error: function(model, error){
							var response = JSON.parse(error.responseText);
							if(response.message && response.message.indexOf("suspended") > 0){						
								$.ajax({
									url: '/ir/secure/api/user/isUserLocked',
							        type: 'GET',
									data: '',
							        contentType: 'application/json',
							        success: function(data) {
							        	if(data === true){
											setTimeout(function(){
												window.location = "/ir/logout.html";
											}, 1000);
										}
									},
							        error: function(){
										console.log('User lock Failure');
										self.enableButton("#signOffButton");
									}
								});	
							}
							self.enableButton();
						 }
	                 });
                }
             },
            
            
            _onSaveSuccess: function(model, response) {
            	this.$el.modal('hide');
                location.reload();
            }

        });

        return SignOffView;
    });