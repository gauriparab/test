/*global define:false */
define(['jquery', 'underscore', 'views/common/confirmModalView', 'hb!templates/workflow/confirm-redirect-to-presets.html'],
       function($, _, ConfirmModalView, bodyTemplate) {
        'use strict';

        /**
         * A redirect to Presets page confirmation dialog.
         *
         * @type {*}
         */
        var ConfirmRedirectModalView = ConfirmModalView.extend({
            _options: {
                bodyTemplate: bodyTemplate,
                headerKey: 'workflow.redirect.label'
            }
        });

        return ConfirmRedirectModalView;

    }
);
