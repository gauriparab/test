/*global define:false */
define(['jquery', 'underscore', 'views/common/confirmModalView', 'views/common/bannersView'],
    function($, _, ConfirmModalView, BannerView) {
        'use strict';

        /**
         * A reset user password confirmation dialog
         *
         * @type {*}
         */
        var ConfirmUserPasswordResetModalView = ConfirmModalView.extend({

            _options: {
                headerKey: 'admin.user.password.reset.confirm.header',
                bodyKey: 'admin.user.password.reset.confirm.body',
                confirmClass: "btn-primary",
                cancelClass: "btn-danger"
            },

            _onConfirm: function() {
                var self = this;
                $.post(this.model.urlRoot + '/resetPassword/' + self.model.get('id'))
                    .done(function() {
                        new BannerView({
                            style: 'success',
                            title: $.t('admin.user.password.reset.success', self.model.toJSON())
                        }).render();
                        self._hide();
                    })
                    .fail(function() {
                        new BannerView({
                            container: self.$('.modal-body'),
                            static: true,
                            id: 'error-banner',
                            style: 'error',
                            title: $.t('admin.user.password.reset.error', self.model.toJSON())
                        }).render();
                    });

            }

        });

        return ConfirmUserPasswordResetModalView;
    }
);
