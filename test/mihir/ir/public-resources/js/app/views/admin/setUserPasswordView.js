/*global define:false */
define(['jquery', 'underscore', 'views/templateView', 'hb!templates/admin/confirm-user-password-reset.html', 'views/common/bannersView'],
    function($, _, TemplateView, bodyTemplate, BannerView) {
        'use strict';

        /**
         * A reset user password confirmation dialog
         *
         * @type {*}
         */
        var ConfirmUserPasswordResetModalView = TemplateView.extend({

            events: {
                'keyup :password': '_validatePassword'
            },

            template: bodyTemplate,

            _validatePassword: function(e) {
                var $field = $(e.currentTarget);
                var $control = $field.closest('.control-group').removeClass('error');

                this._validateSame(e);
                if (!$.trim($field.val())) {
                    $control.addClass('error');
                }
                this.$('#btn-confirm').prop('disabled', $('.control-group').hasClass('error'));
            },

            _validateSame: function(e) {
                var val = $(e.currentTarget).val(),
                    areEqual = true;

                this.$(':password').each(function(index, element) {
                    areEqual = areEqual && $(element).val() === val;
                });

                this.$('#reTypedNewPassword').closest('.control-group').toggleClass('error', !areEqual);

                if(areEqual) {
                    BannerView.clear('#error-banner');
                    $('#createUserSaveButton').removeClass('disabled').prop('disabled', false);
                } else {
                    new BannerView({
                        id: 'error-banner',
                        container: $('.modal-body>#errors'),
                        style: 'error',
                        sticky: true,
                        title: $.t('admin.user.set.password.error.match')
                    }).render();
                    $('#createUserSaveButton').addClass('disabled').prop('disabled', true);
                }
            },

            validate: function() {
                var errors = false;

                this.$(':password').each(function(index, element) {
                    if (!$.trim($(element).val())) {
                        errors = true;
                    }
                });
                
                if (this.$(':password:first').val() !== this.$(':password:last').val()) {
                    errors = true;
                }

                return errors;
            },

            save: function() {
                var data = {
                    id: this.model.get('id')
                };

                this.$('input').each(function() {
                    data[$(this).attr('name')] = $(this).val();
                });

                return $.post(this.model.urlRoot + '/resetPassword', data);

            }

        });

        return ConfirmUserPasswordResetModalView;
    }
);
