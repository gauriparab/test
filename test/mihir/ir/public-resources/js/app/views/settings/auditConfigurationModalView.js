/* global define:false*/
define([
        'views/ParentView',
        'views/common/baseModalView',
        'models/settings/auditConfiguration',
        'models/settings/saveAuditConfiguration',
        'events/eventDispatcher',
        'hb!templates/settings/audit-configuration-modal.html',
        'hb!templates/common/confirm-modal-footer.html'
        ],

		function(
				ParentView,
				BaseModalView,
				AuditConfiguration,
				SaveAuditConfiguration,
				Dispatcher,
				template,
				footer) {

			'use strict';

			var AuditConfigurationModalView = BaseModalView.extend({
				
				_options: function() {
					return {
						bodyTemplate: template,
						headerKey: 'settings.label.auditConfiguration',
						modalOptions : {
		                    backdrop: 'static',
		                    attentionAnimation: null,
		                    keyboard: false,
		                    show : true
		                }
					}
				},
				
				_template : template,
				initialize : function(options) {
					var that = this;
					this.model = new SaveAuditConfiguration();
					this.auditConfigData = {};
					this.auditConfigurationModel = new AuditConfiguration({
						isNonSilent:true
					});
					this.auditConfigurationModel.fetch({
						success:function(){
							that.auditConfigData = that.auditConfigurationModel.toJSON();
							that.options.configs = that.auditConfigData;
							that.render();
						}
					});
				},
				
				events: {
					'click #btnAuditConfigSave': '_onSave',
					'click #btnAuditConfigCancel': '_hide'
				},

				delegateEvents : function() {
					Backbone.View.prototype.delegateEvents.apply(this,arguments);
				},

				undelegateEvents : function() {
					Backbone.View.prototype.undelegateEvents.apply(this,arguments);
				},

				render : function() {
					BaseModalView.prototype.render.call(this);
					this.$('#modalFooter').html(footer({
		            	cancelId: 'btnAuditConfigCancel',
		            	cancelClass: 'btn-default',
		            	cancelKey: 'dialog.cancel',
		            	confirmId: 'btnAuditConfigSave',
		            	confirmClass: 'btn-primary',
		            	confirmKey: 'dialog.save',
		            }));
				},
				
				_onSave: function(){
					this.disableButton();
					var that = this;
					var temp = this.options.configs;
					var data = [];
					var checkboxes = this.$('#boxes input[type="checkbox"]');
					for(var i=0;i<checkboxes.length;i++){
						temp[i].needsReason = checkboxes[i].checked;
						this.model.set(i,temp[i]);
					}
					
					this.model.save(null,{
						success:function(){
							that.$el.modal('hide');
							Dispatcher.trigger('update:auditConfiguration',{
								id : 'success-banner',
								container : $('.main-content>.container-fluid'),
								style : 'success',
								static : false,
								title : 'Audit Configuration Successfully Updated.'
							});
						},
						error: _.bind(that.enableButton, that)
					});
				}
			});
			return AuditConfigurationModalView;
		});