/*global define:false */
define(['jquery', 'underscore', 'views/common/confirmDeleteModalView', 'hb!templates/data/confirm-make-candidate.html'],
    function($, _, ConfirmDeleteModalView, bodyTemplate) {
        'use strict';

        /**
         * A delete samples confirmation dialog
         *
         * @type {*}
         */
        var ConfirmMakeCandidateModalView = ConfirmDeleteModalView.extend({
            initialize: function(options) {
		ConfirmDeleteModalView.prototype.initialize.call(this, _.extend(options || {}, {
                        bodyTemplate: bodyTemplate,
                        reportName: options.reportName,
			headerKey: 'report.confirm.title',
			confirmClass: 'btn-primary',
			cancelClass: ''
                }));
            }
        });

        return ConfirmMakeCandidateModalView;

    }
);
