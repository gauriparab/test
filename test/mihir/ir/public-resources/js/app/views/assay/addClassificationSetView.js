define(['models/assay/classificationSetModel',
        'views/common/baseModalView',
        'events/eventDispatcher',
        'hb!templates/assay/add-classification-set.html',
        'hb!templates/common/confirm-modal-footer.html'], 
    function(
    	ClassificationSet,
        BaseModalView,
        Dispatcher,
        bodyTemplate,
        footerTemplate) {
	'use strict';
	
	var AddClassificationSetView = BaseModalView.extend({
				
		_options: function() {
			return {
				bodyTemplate: bodyTemplate,
				headerKey: this.headerKey,
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true,
                    width: '880px'
                }
			}
		},
		
		events: {
			'click #btnTermSave' : '_onSave',
			'click #btnTermCancel' : '_hide'
		},
		
		initialize: function(options){
			this.options.headerKey = "classification.set.create.label";
			this.model= new ClassificationSet();
			BaseModalView.prototype.initialize.call(this, options);
		},
		
		delegateEvents: function() {
			BaseModalView.prototype.delegateEvents.apply(this, arguments);
            this.$el.on('hidden', _.bind(this.onHide, this));
        }, 
        
		render: function() {
			BaseModalView.prototype.render.call(this);
            this.$('#modalFooter').html(footerTemplate({
            	confirmClass: 'btn-primary',
            	cancelClass: 'btn-default',
            	cancelKey: 'dialog.cancel',
            	confirmKey: 'dialog.save',
            	confirmId: 'btnTermSave',
            	cancelId: 'btnTermCancel'
            }));
		},
		
		_onSave: function() {
			this.disableButton();
			var self=this;
			this.model.set('name', $("#classificationSetName").val()); 
	        this.model.set('notes', $("#classificationSetDescription").val());
	        this.model.set('classificationList', $("#classificationList").val());
	        this.model.save(null, {
				success: function(){
					self.$el.modal('hide');
					Dispatcher.trigger('add:classificationSet', 'classification.set.add.successMessage');
				},
				error: _.bind(self.enableButton, self)
			});
		}
		
		
	});
	
	return AddClassificationSetView;
});