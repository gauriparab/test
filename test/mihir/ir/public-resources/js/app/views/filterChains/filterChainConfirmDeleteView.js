/*global define:false */
define(['jquery', 'underscore', 'views/common/confirmDeleteModalView', 'hb!templates/filterChain/confirm-delete-filterChain.html'],
    function($, _, ConfirmDeleteModalView, bodyTemplate) {
        'use strict';

        /**
         * A delete filter chain confirmation dialog
         *
         * @type {*}
         */
        var ConfirmDeleteFilterChainModalView = ConfirmDeleteModalView.extend({
            initialize: function(options) {
                ConfirmDeleteModalView.prototype.initialize.call(this, _.extend(options || {}, {
                    bodyTemplate: bodyTemplate
                }));
            }
        });

        return ConfirmDeleteFilterChainModalView;

    }
);
