/*global define:false */
define(['jquery', 'underscore', 'views/common/confirmDeleteModalView', 'hb!templates/analysis/confirm-delete-analysis.html'],
    function($, _, ConfirmDeleteModalView, bodyTemplate) {
        'use strict';

        /**
         * A delete analysis confirmation dialog
         *
         * @type {*}
         */
        var ConfirmDeleteAnalysisModalView = ConfirmDeleteModalView.extend({
            initialize: function(options) {
                ConfirmDeleteModalView.prototype.initialize.call(this, _.extend(options || {}, {
                    bodyTemplate: bodyTemplate
                }));
            }
        });

        return ConfirmDeleteAnalysisModalView;

    }
);
