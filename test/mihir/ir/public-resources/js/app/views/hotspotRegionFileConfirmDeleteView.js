/*global define:false */
define(['jquery', 'underscore', 'views/common/confirmDeleteModalView', 'hb!templates/confirm-delete-hotspot-region-file.html'],
    function($, _, ConfirmDeleteModalView, bodyTemplate) {
        'use strict';

        /**
         * A delete hotspot region file confirmation dialog
         *
         * @type {*}
         */
        var ConfirmDeleteHotspotRegionFileModalView = ConfirmDeleteModalView.extend({
            initialize: function(options) {
                ConfirmDeleteModalView.prototype.initialize.call(this, _.extend(options || {}, {
                    bodyTemplate: bodyTemplate,
                    headerKey: $.t('hotspotRegionFile.delete.header.confirm', {name: options.name})
                }));
            }
        });

        return ConfirmDeleteHotspotRegionFileModalView;

    }
);
