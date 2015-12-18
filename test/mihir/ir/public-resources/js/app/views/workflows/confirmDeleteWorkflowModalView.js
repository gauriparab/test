/*global define:false */
define(['jquery', 'underscore', 'views/common/confirmDeleteModalView', 'hb!templates/workflow/confirm-delete-workflow.html'],
    function($, _, ConfirmDeleteModalView, bodyTemplate) {
        'use strict';

        /**
         * A delete Workflow confirmation dialog
         *
         * @type {*}
         */
        var ConfirmDeleteWorkflowModalView = ConfirmDeleteModalView.extend({
            initialize: function(options) {
                ConfirmDeleteModalView.prototype.initialize.call(this, _.extend(options || {}, {
                    bodyTemplate: bodyTemplate
                }));
            }
        });

        return ConfirmDeleteWorkflowModalView;

    }
);
