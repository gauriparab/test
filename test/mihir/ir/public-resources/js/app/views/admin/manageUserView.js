/*global define:false*/
define([
        'jquery',
        'underscore',
        'kendo',
        'views/formView',
        'views/common/baseModalView',
        'models/admin/userModel',
        'views/admin/setUserPasswordView',
        'views/admin/resetUserPasswordModalView_local',
        'views/errorsView', 
        'views/validationErrorsView',
        'models/admin/role',
        'collections/admin/roles',
        'hb!templates/admin/manage-user.html',
        'hb!templates/common/confirm-modal-footer.html',
        'hb!templates/common/spinner.html'
        ].concat('bootstrap'),

    function(
    		$,
    		_,
    		kendo,
    		FormView,
    		BaseModalView,
    		UserModel,
    		SetUserPasswordView,
    		ResetPasswordView,
    		ErrorsView,
    		ValidationErrorsView,
    		Role,
    		Roles,
    		bodyTemplate,
    		footerTemplate,
    		Spinner) {
        'use strict';
        var ManageUserView = BaseModalView.extend({


        	_options: function() {
    			return {
    				bodyTemplate: bodyTemplate,
    				headerKey: this.headerKey,
    				roles: this.options.roles,
    				manageAction: this.manageAction,
    				modalOptions : {
                        backdrop: 'static',
                        attentionAnimation: null,
                        keyboard: false,
                        show : true
                    }
    			}
    		},
    		
            initialize: function(options) {
                options = options || {};
                this.initializeModel(options);

                this._errorsView = new ErrorsView({
                    model: this.model
                });

                if (this.model.id) {
                    this.options.manageAction = 'Edit';
                    this.options.headerKey= "user.edit.label";
                    this.model.fetch({
                        contentType: 'application/json;charset=UTF-8',
                        success: _.bind(this.render, this)
                    });
                } else {
                    this.options.manageAction = 'Create';
                    this.options.headerKey="user.add.label"
                }
                
                BaseModalView.prototype.initialize.call(this, options);

            },

            initializeModel: function(options) {
                this.model = this.model || new UserModel();
                this.completeAction = options.completeAction;
            },

            events: {
                //'change input:not(:checkbox)': 'modelChanged',
                //'change select#userStatus': '_updateUserStatus',
                //'change #privateFolder': 'privacyChanged',
                'click #createUserSaveButton': 'save',
                'click #resetPassword': 'resetPassword',
                'change select#roles': 'roleChanged'
            },
            
            delegateEvents: function() {
    			BaseModalView.prototype.delegateEvents.apply(this, arguments);
                this.$el.on('hidden', _.bind(this.onHide, this));
            },
            
            render: function() {
            	var self = this;
            	BaseModalView.prototype.render.call(self);
            	self.$('#modalFooter').html(footerTemplate({
                	confirmClass: 'btn-primary',
                	cancelClass: 'btn-default',
                	cancelKey: 'dialog.cancel',
                	confirmKey: 'dialog.save',
                	confirmId: 'createUserSaveButton',
                	cancelId: 'createUserCancelButton'
                }));
            	this.roleChanged();
            	
            	
            },
            

            modelChanged: function(e) {
                var field = $(e.currentTarget);
                this.model.set(field.attr('name'), field.val());
            },

            _updateUserStatus: function(e) {
                var select = $(e.currentTarget);

                this.model.set('rdxState', select.val());
            },

            roleChanged: function() {
            	if($("#roles").val() == "3") {
					$("#electronicSignature").attr('checked', false);
					$("#electronicSignature").attr('disabled', 'disabled');
				} else {
					$("#electronicSignature").removeAttr('disabled');
				}
            },

            privacyChanged: function(e) {
                var checkbox = $(e.currentTarget);
                this.model.set('visibilityPreference', checkbox.is(':checked') ? 'PRIVATE' : 'PUBLIC');
            },

            save: function() {
            	this.disableButton($.t("sending.email.label"));
            	
                var updateAttributes = this.model.isNew() ? { rdxState: 'ACTIVE' } : {};
                
                var allRoles=this.options.roles;
                
            	
            	
                var roles = $.grep(allRoles, function(n, i) { 
                	  return n.roleId ===  $("#roles").val();
                });
                
            	this.model.unset('reason');
            	if(this.options.manageAction === 'Edit'){
                	var changes = this.trackChanges();
                	this.model.set('noChange',changes.changed);
	                this.model.set('eSignatureChanged',changes.eSignatureChanged);
                }
                this.model.set('roleDto', roles[0]);
                this.model.set('eSignature', $("#electronicSignature").is(':checked'));
                this.model.set('comments',$("#comments").val());
                this.model.set('rdxState', $("#userStatus").val());
                this.model.set('reason',$('#reason-for-change').val());
                
                this.model.set('userName', $('#userName').val());
                this.model.set('firstName', $('#userFirstName').val());
                this.model.set('lastName', $('#userLastName').val());
                this.model.set('email', $('#userEmail').val());
                
                this.$('.control-group.error').removeClass('error').find('i.icon-warning-sign').remove();
                this.model.save(updateAttributes, {
                    success: _.bind(this._onSaveSuccess, this),
                    error: _.bind(this.enableButton, this) 
                });
            },

            _tryPasswordSave: function(model, response) {
                if (this.passwordView) {
                    this.passwordView.save()
                        .done(_.bind(this._onSaveSuccess, this, model, response))
                        .fail(_.bind(this._onSavePasswordError, this));
                } else {
                    this._onSaveSuccess(model, response);
                }
            },

            _onSaveSuccess: function() {
            	this._hide();
                if (_.isFunction(this.completeAction)) {
                    this.completeAction();
                }
            },

            _onSavePasswordError: function(jqxhr) {
                this.enableButton(this.submitButtonSelector);
                if (jqxhr.status <= 400) {
                    var clientErrorsDiv = this.$('.modal-body #errors');
                    ValidationErrorsView.show(jqxhr, clientErrorsDiv);
                }
            },
        
            
            resetPassword: function(){
				BaseModalView.open(null, {
					el: "#resetPasswordModal",
					model: this.model,
					parent: this
                }, ResetPasswordView);
			},
			
			trackChanges: function(){
				
				var changed = false;
				var eSignatureChange = false;
				
				var prevValues = {
					firstName : this.model.get('firstName'),
					lastName : this.model.get('lastName'),
					email : this.model.get('email'),
					comments : this.model.get('comments'),
					eSignature : this.model.get('eSignature'),
					role : this.model.get('roleDto').roleId,
					state : this.model.get('rdxState')
				}
				
				var newValues = {
					firstName : $('#userFirstName').val(),
					lastName : $('#userLastName').val(),
					email : $('#userEmail').val(),
					comments : $('#comments').val(),
					eSignature : $('#electronicSignature').is(':checked'),
					role : $('#roles').val(),
					state : $('#userStatus').val()
				}
				
				
				for(var value in prevValues) {
					var prevVal = prevValues[value];
					var newVal = newValues[value];
					if(prevVal != newVal){
						changed = true;
					}
				}
				
				if(prevValues.eSignature != newValues.eSignature) {
					changed = true;
					eSignatureChange = true;
				}
				
				return {
					changed:!changed,
					eSignatureChanged:eSignatureChange
				}
			}
			
        });

        return ManageUserView;
    });
