/* global define:false*/
define([ 'jquery', 'underscore', 'backbone', 'models/admin/userModel', 'views/admin/setUserPasswordView',
         'views/errorsView',  'views/validationErrorsView','models/admin/role','collections/admin/roles',
				'hb!templates/admin/create-admin-page.html'],

		function($, _, Backbone,UserModel, SetUserPasswordView, ErrorsView, ValidationErrorsView, Role, Roles,
				template) {

			'use strict';

			/**
			 * create Admin page
			 * 
			 * @type {*}
			 */
			var CreateAdminPageView = Backbone.View
					.extend({

						_template : template,
						

						initialize : function(options) {
							options = options || {};
							this.model= options.model || new UserModel();
							this.roles = new Roles();
						},
						events: {
							"click #createUserCancelButton":"cancel",
							"click #createUserSaveButton": "saveAdmin",
							"click #policiesDismiss":"cancel"
						},


						render : function() {
							 var self = this;
								$.when(this.roles.fetch()).done(function(){
									self.$el.html(self._template({
										model: self.model.toJSON(),
										roles: self.roles.toJSON()
									}));
									
									self.$el.modal({
						                backdrop: 'static',
						                attentionAnimation: null,
						                keyboard: false,
						                show : true
						            });
								});
							
							
						},
						
						cancel: function() {
							window.location.href = "/ir/logout.html";
						},
						
						saveAdmin: function() {
							var self = this;
				            //$.when(this.roles.fetch()).done(function() {
				            	self.model.set('userName', $("#userName").val());
				            	self.model.set('firstName', $("#firstName").val());
				            	self.model.set('lastName', $("#lastName").val());
				            	self.model.set('email', $("#userEmail").val());
				            	self.model.set('comments', $("#comments").val());
				            	self.model.set('eSignature', $("#electronicSignature").val());
				            	self.model.set('roles',roles );
				            	self.model.set('newPassword', $("#newPassword").val());
				            	self.model.set('retypedNewPassword', $("#retypedNewPassword").val());
				            	self.model.set('rdxState','ACTIVE');
			               
			                	var allRoles=self.roles.models;
			                	var adminRole= $("#roles").val();
			                	var roles = _.filter(allRoles, function(n) { 
			                		return n.toJSON().roleId ===  adminRole;
			                	});
			                	self.model.set('roleDto', roles[0]);
			                		                
			                	self.model.set('eSignature', $("#electronicSignature").is(':checked') ? 'true' : 'false');
			                	
			                	self.model.save(self.model.toJSON(), {
		                		success: _.bind(self._onSaveSuccess, self)
		                	});
			                
			                //});
						},
						
						_onSaveSuccess: function() {
							window.location.href = "/ir/logout.html#adminCreated";
						}

						

			
						
						

					});

			return CreateAdminPageView;
		});
