/*global define:false */
define(['jquery', 'underscore', 'views/common/confirmModalView', 'hb!templates/workflow/confirm-cancel-workflow.html'],
       function($, _, ConfirmModalView, bodyTemplate) {
        'use strict';

        /**
         * A cancel workflow confirmation dialog.
         *
         * @type {*}
         */
        var ConfirmCancelWorkflowModalView = ConfirmModalView.extend({
            initialize: function(options) {
                ConfirmModalView.prototype.initialize.call(this, _.extend(options || {}, {
                    bodyTemplate: bodyTemplate,
                    headerKey: 'confirm.cancel'
                }));
            }
        });

        return ConfirmCancelWorkflowModalView;

    }
);
