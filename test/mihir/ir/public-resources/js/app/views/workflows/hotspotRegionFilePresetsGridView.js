/*global define:false*/
define([
    'jquery',
    'underscore',
    'views/workflows/presetsGridView',
    'models/hotspotRegionFile'
], function(
    $,
    _,
    PresetsGridView,
    HotspotRegionFile
) {
    'use strict';

    /**
     * A re-usable presets grid view
     *
     * @type {*}
     */
    var HotspotRegionFilePresetsGridView = PresetsGridView.extend({

        _url : '/ir/secure/api/v40/hotspotregions',

        _model : HotspotRegionFile,

        _columns: function() {
            return [
                this._factoryProvidedColumn(),
                this._nameColumn(),
                this._applicationVersionColumn(),
                this._createdByColumn(),
                this._createdOnColumn()
            ];
        },

        _nameColumn: function() {
            return _.extend(PresetsGridView.prototype._nameColumn.apply(this, arguments), {
                width: '35%'
            });
        }

    });

    return HotspotRegionFilePresetsGridView;
});
