/*global define:false */
define(['jquery', 'underscore', 'views/common/confirmModalView', 'hb!templates/workflow/confirm-lock-workflow.html'],
       function($, _, ConfirmModalView, bodyTemplate) {
        'use strict';

        /**
         * A lock workflow confirmation dialog.
         *
         * @type {*}
         */
        var ConfirmLockWorkflowModalView = ConfirmModalView.extend({
            initialize: function(options) {
                ConfirmModalView.prototype.initialize.call(this, _.extend(options || {}, {
                    bodyTemplate: bodyTemplate,
                    headerKey: 'workflow.lock.header'
                }));
            }
        });

        return ConfirmLockWorkflowModalView;

    }
);
