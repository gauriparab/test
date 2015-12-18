define([
        'views/common/baseModalView',
        'models/settings/logs',
        'events/eventDispatcher',
        'views/common/auditTrailView',
        'hb!templates/settings/manage-logs-view.html',
        'hb!templates/common/confirm-modal-footer.html'], 
    function(
        BaseModalView,
        Logs,
        Dispatcher,
        AuditTrailView,
        bodyTemplate,
        footerTemplate) {
	'use strict';
	
	var addSpecimenView = BaseModalView.extend({
				
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
		
		events: {
			'click #log-settings-audit-trail': '_onOpenAuditTrailModal',
			'click #set-logs' : '_onSave',
			'click #cancel' : '_hide'
		},
		
		initialize: function(options){
			this.options.headerKey = 'settings.logs.manageLogs';
			this.model = new Logs({type:'get'});
			BaseModalView.prototype.initialize.call(this, options);
		},
		
		delegateEvents: function() {
			BaseModalView.prototype.delegateEvents.apply(this, arguments);
        },
		
		render: function() {
			var that = this;
			$.when(this.model.fetch()).done(function(){
				BaseModalView.prototype.render.call(that);
				var ret = that.model.get('retentionPeriod');
				var autoDelete = that.model.get('enableAutoDeletion');
				
				that.$('#retention-period').val(ret);
				that.$('#auto-delete').prop('checked',autoDelete);
				that.$('#modalFooter').html(footerTemplate({
	            	confirmClass: 'btn-primary',
	            	cancelClass: 'btn-default',
	            	cancelKey: 'dialog.cancel',
	            	confirmKey: 'dialog.save',
	            	confirmId: 'set-logs',
	            	cancelId: 'cancel'
	            }));
				return that;
			});
		},
		
		_onOpenAuditTrailModal: function(){
			var data=[];
			var temp={};
			temp.key="audit.trail.systemSettingsObject";
			temp.value="Log Settings";
			data.push(temp);
			var model= this.getSettingsModel;
			var self = this;
			BaseModalView.open(null, {
				type: "audit_trail",
				el: "#log-settings-audit-modal",
				model:model,
				data:data,
				gridViewUrl:'/ir/secure/api/settings/getAuditData',
				filters:{objectId : "log_settings"},
				detailsViewUrl:'/ir/secure/api/settings/getAuditDetails' + "?objectId=log_settings"
			}, AuditTrailView);
		},

		_onSave: function() {
			this.disableButton();
			var that = this;
			var saveModel = new Logs({type:'set'});
			var retention = +(this.$('#retention-period').val());
			var autoDelete = this.$('#auto-delete').prop('checked');
			
			saveModel.set('retentionPeriod', retention);
			saveModel.set('enableAutoDeletion',autoDelete);
			saveModel.set('id','1');
			saveModel.unset('type',autoDelete);
			
			
			saveModel.save(null, {
				success: function(req,res){
					that.$el.modal('hide');
					Dispatcher.trigger('update:logs',{
						res:res
					});
				},
				error: _.bind(that.enableButton, that)
			});
		}
		
	});
	
	return addSpecimenView;
});