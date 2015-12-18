/*global define:false*/
define([
    'jquery',
    'i18n',
    'backbone',
    'underscore',
    'models/changePasswordModel',
    'views/ParentView',
    'views/common/bannersView',
    'views/common/dialog',
    'hb!templates/change-password.html'
],
    function ($,
              i18n,
              Backbone,
              _,
              ChangePasswordModel,
              ParentView,
              BannerView,
              Dialog,
              template) {

        'use strict';

        var ChangePasswordView = ParentView.extend({

            events: {
                'keyup :input': '_keyUpInInput'
            },

            initialize: function (options) {
            	this.options= options || {};
				this.model = new ChangePasswordModel();
				if(this.options.model.toJSON().passwordExpired) {
					this.model.set('passwordExpired', true);
            	}
                this.listenTo(this.model, 'request', this._clearAllVisibleErrors);
                this.listenTo(this.model, 'error', this._errorModel);
                this.listenTo(this.model, 'sync', this._syncModel);

                this.listenTo(this, 'confirm', this._save);
            },

            render: function () {
                this.$el.html(template(this.model.toJSON()));
            },

            _keyUpInInput: function () {
                this._clearAllVisibleErrors();
                this._updateModelFromDom();
            },

            _addErrorToField: function (fieldName) {
                this.$('.control-group').has('input[name=' + fieldName + ']').addClass('error');
            },

            _clearAllVisibleErrors: function () {
                this.$('#changePasswordClientErrors').empty();
                this.$el.find('.control-group').removeClass('error');
            },

            _errorModel: function (model, response) {
                var error = JSON.parse(response.responseText);
                _.each(error.errors.allErrors, function(e) {
                    if (e.field) {
                        this._addErrorToField(e.field);
                    }
                }, this);
            },

            _syncModel: function () {
                // Clear the model so that the state will be clean when the dialog is opened again.
            	
            	var bannerView = new BannerView({
                    style: 'success',
                    title: i18n.t('profile.changePassword.success')
                });

                bannerView.render();	
                
                this.model.set({
                    existingPassword: '',
                    newPassword: '',
                    retypedNewPassword: ''
                });
                this.render();
            },

            _save: function (event) {
                event.preventDefault();
                this._updateModelFromDom();
                //return this.model.save();
                return this.model.save(null, {
                	success: function() {
                		 window.location.href = "/ir/logout.html#passwordReset";
                	}
                });
            },

            _updateModelFromDom: function () {
                this.model.set({
                    existingPassword: this.$('#existingPassword').val(),
                    newPassword: this.$('#newPassword').val(),
                    retypedNewPassword: this.$('#retypedNewPassword').val()
                });
            }
        });

        ChangePasswordView.openDialog = function (options) {
            var model = new ChangePasswordModel();
            if(options) {
            	var passwordExpired= options.passwordExpired;
                model.set('passwordExpired',passwordExpired);
            }
            
            var dialog = Dialog.open({
                id: 'changePasswordModal',
                idPrefix: 'changePasswordModal',
                headerKey: 'dialog.changePassword.title',
                confirmKey: 'dialog.changePassword.confirm',
                closeKey: 'dialog.changePassword.close',
                bodyView: ChangePasswordView,
                autoValidate: false
            }, {
                model: model
            }, function(clickEvent, modalView) {
                return modalView._save.call(modalView, clickEvent);
            });
            


            return {
                dialogView: dialog
            };
        };

        return ChangePasswordView;

    });