/* global define:false*/
define([
        'models/settings/emailSettings',
        'models/settings/sendTestEmail',
        'views/common/bannersView',
        'views/ParentView',
        'views/common/baseModalView',
        'views/common/auditTrailView',
        'hb!templates/settings/configuration-email-settings-view.html',
        'hb!templates/common/spinner.html'
        ],

		function(
				EmailSettings,
				SendTestEmail,
				BannersView,
				ParentView,
				BaseModalView,
				AuditTrailView,
				template,
				Spinner) {

			'use strict';

			var ConfigurationNetworkSettingsView = ParentView.extend({

				_template : template,
				
				_settings:{},
				
				initialize : function(options) {
					var that = this;
					this.getEmailSettingsModel = new EmailSettings({requestType:'get'});
					this.setEmailSettingsModel = new EmailSettings({requestType:'set'});
					
					this.sendTestEmailModel = new SendTestEmail();
					
					this.getEmailSettingsModel.fetch({
						success:function(){
							that._settings = that.getEmailSettingsModel.toJSON();
							that.render();
						},
						error:function(){
							
						}
					});
				},
				
				events: {
					'click #email-settings-audit-trail': '_onOpenAuditTrailModal',
					'click #update': '_saveSettings',
					'click #send-test': 'sendTestEmail',
					'click #reset': '_reset'	
				},

				delegateEvents : function() {
					Backbone.View.prototype.delegateEvents.apply(this, arguments);
				},

				undelegateEvents : function() {
					Backbone.View.prototype.undelegateEvents.apply(this, arguments);
				},

				render : function() {
					this.$el.html(this._template({settings:this._settings}));
				},
				
				_onOpenAuditTrailModal: function(){
					var data=[];
					var temp={};
					temp.key="audit.trail.systemSettingsObject";
					temp.value="Email Settings";
					data.push(temp);
					var model= this.getSettingsModel;
					var self = this;
					BaseModalView.open(null, {
						type: "audit_trail",
						el: "#email-settings-audit-modal",
						model:model,
						data:data,
						gridViewUrl:'/ir/secure/api/settings/getAuditData',
						filters:{objectId : "email_settings"},
						detailsViewUrl:'/ir/secure/api/settings/getAuditDetails' + "?objectId=email_settings"
					}, AuditTrailView);
				},

				_saveSettings:function(){
					
					var self=this;
					
					this.setEmailSettingsModel.unset('requestType');
					
					var tls = $('#tls').is(':checked');
					var smtp = $('#smtp').val();
					var port = $('#port').val();
					var username = $('#email-username').val();
					var password = $('#email-password').val();
					var sender = $('#sender').val();
					
					this.setEmailSettingsModel.set('smtpServerURL',smtp);
					this.setEmailSettingsModel.set('port',port);
					this.setEmailSettingsModel.set('userName',username);
					this.setEmailSettingsModel.set('password',password);
					this.setEmailSettingsModel.set('senderAddress',sender);
					this.setEmailSettingsModel.set('useTLS',tls);
					
					this.setEmailSettingsModel.save(null,{
						success:function(){
							self.initialize();
							new BannersView({
								id : 'success-banner',
								container : $('.main-content #email-messages'),
								style : 'success',
								static : false,
								title :$.t('settings.configurationPage.emailTab.updateEmailDetails')
							}).render();
						}
					});
					
				},
				
				sendTestEmail:function(){
					var self=this;
					
					this.disableButton();
					
					var tls = $('#tls').is(':checked');
					var smtp = $('#smtp').val();
					var port = $('#port').val();
					var username = $('#email-username').val();
					var password = $('#email-password').val();
					var sender = $('#sender').val();
					
					this.sendTestEmailModel.set('smtpServerURL',smtp);
					this.sendTestEmailModel.set('port',port);
					this.sendTestEmailModel.set('userName',username);
					this.sendTestEmailModel.set('password',password);
					this.sendTestEmailModel.set('senderAddress',sender);
					this.sendTestEmailModel.set('useTLS',tls);
					this.sendTestEmailModel.fetch({
						success:function(req,res){
							new BannersView({
								id : 'success-banner',
								container : $('.main-content #email-messages'),
								style : 'success',
								static : false,
								title : $.t('settings.configurationPage.emailTab.sendTestSuccess')+" "+res
							}).render();
							self.enableButton();
						},
						error: function(){
							self.enableButton();
						}
						
					});
				},
				
				_reset: function() {
					this.render();
				},
				
				enableButton: function(){
					this.$("#send-test")
	                .removeClass('disabled')
	                .prop('disabled', false)
	                .removeAttr('title');
					this.$('#buttonGroup .icon-loader').remove();
				},
				
				disableButton: function(){
					var element = $("#send-test");
					if (element.hasClass('disabled')) {
						return false;
					}
					element.addClass('disabled').prop('disabled', true);				
					element.after(Spinner());				
					element.attr('title', $.t("sending.email.label"));
					return true;
				}
				
			});
			return ConfigurationNetworkSettingsView;
		});
