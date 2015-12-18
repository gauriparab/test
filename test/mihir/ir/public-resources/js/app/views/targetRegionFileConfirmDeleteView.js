/*global define:false */
define(['jquery', 'underscore', 'views/common/confirmDeleteModalView', 'hb!templates/confirm-delete-target-region-file.html'],
    function($, _, ConfirmDeleteModalView, bodyTemplate) {
        'use strict';

        /**
         * A delete target region file confirmation dialog
         *
         * @type {*}
         */
        var ConfirmDeleteTargetRegionFileModalView = ConfirmDeleteModalView.extend({
            initialize: function(options) {
                ConfirmDeleteModalView.prototype.initialize.call(this, _.extend(options || {}, {
                    bodyTemplate: bodyTemplate,
                    headerKey: $.t('targetRegionFile.delete.header.confirm', {name: options.name})
                }));
            }
        });

        return ConfirmDeleteTargetRegionFileModalView;

    }
);
