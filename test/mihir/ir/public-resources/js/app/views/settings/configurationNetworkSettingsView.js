/* global define:false*/
define([
        'models/settings/networkSettings',
        'views/common/bannersView',
        'views/ParentView',
        'views/common/baseModalView',
        'views/common/auditTrailView',
        'hb!templates/settings/configuration-network-settings-view.html'
        ],

		function(
				NetworkSettings,
				BannersView,
				ParentView,
				BaseModalView,
				AuditTrailView,
				template) {

			'use strict';

			var ConfigurationNetworkSettingsView = ParentView.extend({

				_template : template,

				_settings:{},
				_status:{},

				initialize : function(options) {
					var that = this;
					this.getSettingsModel = new NetworkSettings({requestType:'getSettings'});
					this.setSettingsModel = new NetworkSettings({requestType:'save'});
					this.getStatusModel = new NetworkSettings({requestType:'getStatus'});

					this.getSettingsModel.fetch({
						success:function(){
							that._settings = that.getSettingsModel.toJSON();
							that.render();
						},
						error:function(req,res){
							console.log(req);
							console.log(res);
						}
					});

					this.getStatusModel.fetch({
						success:function(){
							that.getStatusModel.unset('requestType');
							that._status = that.getStatusModel.toJSON();

							var status = [];

							for(var st in that._status){
								var obj = {};
								obj.key = st;
								obj.value =that._status[st];
								status.push(obj);
							}
							that._status = status;
							that.render();
						},
						error:function(req,res){
							console.log(req);
							console.log(res);
						}
					});
					
					this.needsReason=options.needsReason;

				},

				events: {
					'click #network-settings-audit-trail': '_onOpenAuditTrailModal',
					'click #save-network-settings': '_saveSettings',
					'click #reset-network-settings': '_resetSettings'
				},

				delegateEvents : function() {
					Backbone.View.prototype.delegateEvents.apply(this, arguments);
				},

				undelegateEvents : function() {
					Backbone.View.prototype.undelegateEvents.apply(this, arguments);
				},

				render : function() {
					this.$el.html(this._template({settings:this._settings,status:this._status, reason: this.needsReason}));

					var inputs = this.$('#toggleable input');
					var resetButton = this.$('#reset-network-settings');
					this.$('#ip-toggle input').on('click',function(){
						if(this.id==='dhcp'){
							inputs.prop('disabled',true);
						} else{
							inputs.prop('disabled',false);
						}
					});

					if(this._settings.isDHCP){
						$('#dhcp').trigger('click',{});
					}

					if(this._settings.message){
						for(var i=0;i<this._settings.message.length;i++){
							new BannersView({
								container : $('.main-content #network-messages'),
								style : 'error',
								static : false,
								title : this._settings.message[i]
							}).render();
						}
					}
				},
				_onOpenAuditTrailModal: function(){
					var data=[];
					var temp={};
					temp.key="audit.trail.systemSettingsObject";
					temp.value="Network Settings";
					data.push(temp);
					var model= this.getSettingsModel;
					var self = this;
					BaseModalView.open(null, {
						type: "audit_trail",
						el: "#network-settings-audit-modal",
						model:model,
						data:data,
						gridViewUrl:'/ir/secure/api/settings/getAuditData',
						filters:{objectId : "network_settings"},
						detailsViewUrl:'/ir/secure/api/settings/getAuditDetails' + "?objectId=network_settings"
					}, AuditTrailView);
				},

				_saveSettings:function(){
					var dhcp = $('#dhcp').is(':checked');
					var ip = $('#ipAddress').val();
					var sunet = $('#subnet').val();
					var gateway = $('#gateway').val();
					var ns = $('#name-servers').val();
					var pu = $('#proxy-server').val();
					var pp = $('#proxy-port').val();
					var un = $('#username').val();
					var pw = $('#password').val();

					this.setSettingsModel.set('isDHCP',dhcp);
					this.setSettingsModel.set('dhcp',dhcp);
					this.setSettingsModel.set('ipAddress',ip);
					this.setSettingsModel.set('subnet',sunet);
					this.setSettingsModel.set('gateway',gateway);
					this.setSettingsModel.set('nameServers',ns);
					this.setSettingsModel.set('proxyServerAdress',pu);
					this.setSettingsModel.set('proxyServerPort',pp);
					this.setSettingsModel.set('proxyServerUsername',un);
					this.setSettingsModel.set('proxyServerPassword',pw);
					
					if(this.needsReason) {
						this.setSettingsModel.set('reason',this.$('#reason-for-change').val());
					}

					this.setSettingsModel.save(null,{
						success:function(){
							new BannersView({
								id : 'success-banner',
								container : $('.main-content #network-messages'),
								style : 'success',
								static : false,
								title : 'Network Settings Updated Successfully.'
							}).render();
						},
						error:function(req,res){
							var x = JSON.parse(res.responseText);

							new BannersView({
								container : $('.main-content #network-messages'),
								style : 'error',
								static : false,
								title : x.message
							}).render();
						}
					});

				},

		        _resetSettings: function(){
		        	var that=this;
		        	this.getSettingsModel.fetch({
						success:function(){
							that._settings = that.getSettingsModel.toJSON();
							that.render();
						},
					});
		        }

			});
			return ConfigurationNetworkSettingsView;
		});
