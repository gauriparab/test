/* global define:false*/
define([ 'jquery', 'underscore', 'backbone', 'models/admin/profileModel', 'views/common/baseModalView', 'views/changePasswordView',
         'views/admin/changeEmailView',
		'hb!templates/admin/profile-page.html'],

		function($, _, Backbone, ProfileModel, BaseModalView, ChangePasswordView, ChangeEmailView,
				template) {

			'use strict';

			/**
			 * create Profile page
			 * 
			 * @type {*}
			 */
			
			
			var ProfileView = Backbone.View
					.extend({
						
						 el: ".main-content",
						 
						_template : template,
						

						initialize : function() {
							this.model= new ProfileModel();
						},
						events: {
							'click #changePassword': 'changePassword',
							'click #changeEmail': 'changeEmail'
						},


						render : function() {
							var self= this;
							/*$.when(self.model.fetch()).done(function() {
								self.$el.html(self._template({
									user: self.model.toJSON()
								}));	
							});*/
							this.model.fetch({
							    success: function() {
								self.$el.html(self._template({
                                                    user: self.model.toJSON()
                                             }));
							    }
							}); 
							
						},
						
						changePassword: function(){
							ChangePasswordView.openDialog();
						},
						
						changeEmail: function(){
							BaseModalView.open(null, {
		                        el: "#manageUserModal",
		                        user: this.model,
		                        parent: this
		                    }, ChangeEmailView);
							
						},
						

					});

			return ProfileView;
		});
		
