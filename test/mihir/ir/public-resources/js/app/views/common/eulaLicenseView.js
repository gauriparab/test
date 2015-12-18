/*global define:false, window:false */
define(['jquery',
    'underscore',
    'backbone',
    'views/common/confirmModalView', 'hb!templates/common/login-eula-license-modal.html'
].concat('bootstrap.modal', 'bootstrap.modalmanager'), function ($, _, Backbone, ConfirmModalView, EulaModalTemplate) {

    'use strict';

    /**
     * A EULA confirmation dialog
     */
    var EulaView = Backbone.View.extend({
        initialize: function () {
            _.bindAll(this, 'showPopup', 'acceptEula', 'cancelEula');

            // Reset EulaAccepted flag to false
            this.eulaAccepted = false;

            // Download EulaLicense from EulaModel
            this.model.fetch({
                success: this.showPopup
            });
        },

        showPopup: function () {
            // Show popup with `data`
            ConfirmModalView.open(this.acceptEula, {
                headerKey:  this.options.hosted ? 'confirm.eula.title' : 'confirm.eula.local.title',
                confirmKey: 'confirm.accept',
                cancelKey:  'confirm.cancel',
                confirmClass: 'btn-primary',
                confirmId: 'btn-confirm',
                bodyKey: this.model.get('eula'),
                onHide: this.cancelEula,
                template : EulaModalTemplate,
                modalOptions : {
                    width: 700,
                    maxHeight: 400,
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true
                }
            }, ConfirmModalView);
            return this;
        },

        acceptEula: function () {
            // Set flag for EulaAccepted
            this.eulaAccepted = true;
            window.location.href = "/ir/secure/eulaLicence/license/accept";
        },

        cancelEula: function () {
            if (!this.eulaAccepted) {
                // Redirect to logout page if eulaAccepted is false.
                window.location.href = "/ir/logout.html";
            }
        }
    });

    return EulaView;
});
