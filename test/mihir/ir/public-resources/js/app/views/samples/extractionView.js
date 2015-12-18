define(['views/common/baseModalView',
        'hb!templates/sample/extraction.html',
        'hb!templates/common/confirm-modal-footer.html'], 
    function(
        BaseModalView,
        bodyTemplate,
        footerTemplate) {
	'use strict';
	
	var ExtractionView = BaseModalView.extend({
				
		_options: function() {
			return {
				bodyTemplate: bodyTemplate,
				headerKey: this.headerKey,
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true,
                }
			}
		},
		
		events: {
			'click #btnExtractionSave' : '_onSave',
			'click #btnExtractionCancel' : '_hide'
		},
		
		initialize: function(options){
			this.options.headerKey = "specimen.extraction.label";
			/*this.options.specimenIdColOne=[];
			this.options.specimenIdColTwo=[];
			var self=this;
			_.each(options.specimenIds, function(num,index){
				if(index % 2 == 0){
					self.options.specimenIdColOne.push(num);
				} else {
					self.options.specimenIdColTwo.push(num);
				}
			});*/
			this.options.specimenIds = options.specimenIds.toString();
			BaseModalView.prototype.initialize.call(this, options);
			this.onComplete = options.onComplete;
		},
		
		
		render: function() {
			BaseModalView.prototype.render.call(this);
            this.$('#modalFooter').html(footerTemplate({
            	confirmClass: 'btn-primary',
            	cancelClass: 'btn-default',
            	cancelKey: 'dialog.cancel',
            	confirmKey: 'dialog.save',
            	confirmId: 'btnExtractionSave',
            	cancelId: 'btnExtractionCancel'
            }));
		},
		
		_onSave: function() {
			this.disableButton();
			var self=this;
			var data={
				specimenIds:this.options.specimenIds,
				extractionKit:$("#extractionKitBarcode").val()
			}
			$.ajax({
                url: '/ir/secure/api/specimen/extraction',
                type: 'POST',
		        contentType: 'application/json',
		        dataType: 'json',
		        data: JSON.stringify(data),
                success: function(response) {
                	self.$el.modal('hide');
					self.onComplete();
                },
                error: _.bind(self.enableButton, self)
                
            });
		},
		
		delegateEvents: function() {
			BaseModalView.prototype.delegateEvents.apply(this, arguments);
            this.$el.on('hidden', _.bind(this.onHide, this));
        }
		
		
	});
	
	return ExtractionView;
});