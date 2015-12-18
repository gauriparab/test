/* global define:false*/
define([
        'models/settings/labInformation',
        'views/ParentView',
        'views/common/bannersView',
        'views/common/baseModalView',
        'views/common/auditTrailView',
        'hb!templates/settings/configuration-lab-info-view.html'
        ],

		function(
				LabInformation,
				ParentView,
				BannersView,
				BaseModalView,
				AuditTrailView,
				template) {

			'use strict';

			var ConfigurationLabInfoView = ParentView.extend({

				_template : template,
				
				_settings:{},
				
				initialize : function(options) {
					var that = this;
					this.lanInfo = null;
					this.labInfoModel = new LabInformation({
						type:'get'
					});
					
					this.labInfoModel.fetch({
						success:function(){
							that.lanInfo = that.labInfoModel.toJSON();
							that.render();
						}
					});
					
					this.saveLabInfoModel = new LabInformation({
						type:'set'
					});
				},
				
				events: {
					'click #lab_contact-audit-trail': '_onOpenLabContactAuditTrailModal',
					'click #it-contact-audit-trail': '_onOpenItContactAuditTrailModal'	
				},

				delegateEvents : function() {
					Backbone.View.prototype.delegateEvents.apply(this, arguments);
				},

				undelegateEvents : function() {
					Backbone.View.prototype.undelegateEvents.apply(this, arguments);
				},
				
				_onOpenLabContactAuditTrailModal: function(){
					var data=[];
					var temp={};
					temp.key="audit.trail.systemSettingsObject";
					temp.value="Lab Contact Settings";
					data.push(temp);
					var model= this.getSettingsModel;
					var self = this;
					BaseModalView.open(null, {
						type: "audit_trail",
						el: "#lab_contact-audit-trailModal",
						model:model,
						data:data,
						gridViewUrl:'/ir/secure/api/settings/getAuditData',
						filters:{objectId : "lab_contact"},
						detailsViewUrl:'/ir/secure/api/settings/getAuditDetails' + "?objectId=lab_contact"
					}, AuditTrailView);
				},
				
				_onOpenItContactAuditTrailModal: function(){
					var data=[];
					var temp={};
					temp.key="audit.trail.systemSettingsObject";
					temp.value="It Contact Settings";
					data.push(temp);
					var model= this.getSettingsModel;
					var self = this;
					BaseModalView.open(null, {
						type: "audit_trail",
						el: "#it_contact-audit-trailModal",
						model:model,
						data:data,
						gridViewUrl:'/ir/secure/api/settings/getAuditData',
						filters:{objectId : "it_contact"},
						detailsViewUrl:'/ir/secure/api/settings/getAuditDetails' + "?objectId=lab_contact"
					}, AuditTrailView);
				},

				render : function() {
					
					var that = this;
					
					if(this.lanInfo === null) return;
					
					this.$el.html(this._template({info:this.lanInfo}));
					
					var labInputs = this.$('.lab-inputs input.reset');
					var itInputs = this.$('.it-inputs input.reset');
					
					this.$('#lab-edit').on('click',function(){
						that.$(this).css('display','none');
						that.$('#lab-save').css('display','inline-block');		
						that.$("#lab-reset").show();
						labInputs.prop('disabled',false);						
					});
					
					this.$('#it-edit').on('click',function(){
						that.$(this).css('display','none');
						that.$('#it-save').css('display','inline-block');
						that.$("#it-reset").show();
						itInputs.prop('disabled',false);
					});
					
					this.$('#lab-reset').on('click',function(){
						that.labInfoModel.fetch({
							success:function(){
								that.lanInfo = that.labInfoModel.toJSON();
								var obj = _.find(that.lanInfo, function(temp){ return temp.labContact});
								$("#lab-name").val(obj.contactInfoDto.name);
								$("#lab-phone").val(obj.contactInfoDto.phone);
								$("#lab-email").val(obj.contactInfoDto.email);
							}
						});
					});
					this.$('#it-reset').on('click',function(){
						that.labInfoModel.fetch({
							success:function(){
								that.lanInfo = that.labInfoModel.toJSON();
								var obj = _.find(that.lanInfo, function(temp){ return !temp.labContact});
								$("#it-name").val(obj.contactInfoDto.name);
								$("#it-phone").val(obj.contactInfoDto.phone);
								$("#it-email").val(obj.contactInfoDto.email);
							}
						});
					});
					
					this.$('#lab-save').on('click',function(){
						
						that.lanInfo[0].labContact = true;
						var data = {};
						var obj = {};
						
						data.labContact = true;
						
						obj.name = that.$('#lab-name').val();
						obj.email = that.$('#lab-email').val();
						obj.phone = that.$('#lab-phone').val();
						
						data.contactInfoDto = obj;
						
						
						that.saveLabInfoModel.attributes = data;
						
						that.saveLabInfoModel.set('id',1);
						that.saveLabInfoModel.unset('type');
						
						that.saveLabInfoModel.save(null,{
							success:function(){
								new BannersView({
									id : 'success-banner',
									container : $('.main-content #lab-messages'),
									style : 'success',
									static : false,
									title : 'Contact Details Updated Successfully'
								}).render();
								$('#lab-save').css('display','none');
								$("#lab-reset").hide();
								$('#lab-edit').css('display','inline-block');
								labInputs.prop('disabled',true);
								
							},
							error:function(){
								new BannersView({
									container : $('.main-content #lab-messages'),
									style : 'error',
									static : false,
									title : 'Failed To Save Contact Details'
								}).render();
							}
						});
					});
					
					this.$('#it-save').on('click',function(){
						var data = {};
						var obj = {};
						
						data.labContact = false;
						
						obj.name = that.$('#it-name').val();
						obj.email = that.$('#it-email').val();
						obj.phone = that.$('#it-phone').val();
						
						data.contactInfoDto = obj;
						
						that.saveLabInfoModel.attributes = data;
						
						that.saveLabInfoModel.set('id',1);
						that.saveLabInfoModel.unset('type');
						
						that.saveLabInfoModel.save(null,{
							success:function(){
								new BannersView({
									id : 'success-banner',
									container : $('.main-content #lab-messages'),
									style : 'success',
									static : false,
									title : 'Contact Details Updated Successfully'
								}).render();
								$('#it-save').css('display','none');
								$("#it-reset").hide();
								$('#it-edit').css('display','inline-block');
								itInputs.prop('disabled',true);
							},
							error:function(){
								new BannersView({
									container : $('.main-content #lab-messages'),
									style : 'error',
									static : false,
									title : 'Failed To Save Contact Details'
								}).render();
							}
						});
					});
					
					
				}
			});
			return ConfigurationLabInfoView;
		});
