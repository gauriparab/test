/*global define:false */
define(['jquery', 'underscore', 'views/common/confirmDeleteModalView', 'hb!templates/assay/confirm-delete-plan.html'],
    function($, _, ConfirmDeleteModalView, bodyTemplate) {
        'use strict';

        /**
         * A delete samples confirmation dialog
         *
         * @type {*}
         */
        var ConfirmDeleteSamplesModalView = ConfirmDeleteModalView.extend({
            initialize: function(options) {
		ConfirmDeleteModalView.prototype.initialize.call(this, _.extend(options || {}, {
                        bodyTemplate: bodyTemplate,
                        cantDelete: options.cantDelete,
                        canDelete: options.canDelete,
			headerKey: 'plan.delete.popup.title',
			confirmClass: 'btn-primary',
			cancelClass: ''
                }));
            }
        });

        return ConfirmDeleteSamplesModalView;

    }
);
