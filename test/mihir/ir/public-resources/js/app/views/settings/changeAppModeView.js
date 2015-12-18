define([
        'views/common/baseModalView',
        'models/settings/changeAppMode',
        'events/eventDispatcher',
        'hb!templates/settings/change-app-mode-view.html',
        'hb!templates/common/confirm-modal-footer.html'], 
    function(
        BaseModalView,
        ChangeAppMode,
        Dispatcher,
        bodyTemplate,
        footerTemplate) {
	'use strict';
	
	var ChanceAppModeView = BaseModalView.extend({
				
		_options: function() {
			return {
				bodyTemplate: bodyTemplate,
				headerKey: this.headerKey,
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true
                }
			}
		},
		_footer : footerTemplate,
		events: {
			'click #set-mode' : '_onSave',
			'click #cancel' : '_hide'
		},
		
		initialize: function(options){
			this.options.headerKey = 'Change App Mode';
			this.getModel = new ChangeAppMode({type:'get'});
			BaseModalView.prototype.initialize.call(this, options);
		},
		
		delegateEvents: function() {
			BaseModalView.prototype.delegateEvents.apply(this, arguments);
        },
		
		render: function() {
			var that = this;
			this.getModel.unset('type');
			
			this.getModel.fetch({
				success: function(){
					var model = that.getModel.toJSON();
					that.options.server_mode = model.server_mode;
					BaseModalView.prototype.render.call(that);
					that.$('#modalFooter').html(that._footer({
		            	confirmClass: 'btn-primary',
		            	cancelClass: 'btn-default',
		            	cancelKey: 'dialog.cancel',
		            	confirmKey: 'dialog.save',
		            	confirmId: 'set-mode',
		            	cancelId: 'cancel'
		            }));
				}
			})
			
			BaseModalView.prototype.render.call(this);
		},
		
		_onSave: function() {
			this.disableButton();
			var self=this;
			var mode = this.$('input[type="radio"]:checked').val();
			this.setModel = new ChangeAppMode({type:'set',mode:mode});
			this.setModel.unset('type');
			this.setModel.save(null,{
				success:function(){
					console.log('Save Successful');
				},
				error: _.bind(self.enableButton, self)
			});
		}
		
	});
	
	return ChanceAppModeView;
});