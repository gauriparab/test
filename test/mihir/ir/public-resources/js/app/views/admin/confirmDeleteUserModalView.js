/*global define:false */
define(['jquery', 'underscore', 'views/common/confirmDeleteModalView', 'hb!templates/admin/confirm-delete-user.html'],
    function($, _, ConfirmDeleteModalView, bodyTemplate) {
        'use strict';

        /**
         * A delete user confirmation dialog
         *
         * @type {*}
         */
        var ConfirmDeleteUserModalView = ConfirmDeleteModalView.extend({
            initialize: function(options) {
                ConfirmDeleteModalView.prototype.initialize.call(this, _.extend(options || {}, {
                    bodyTemplate: bodyTemplate
                }));
            }
        });

        return ConfirmDeleteUserModalView;

    }
);
