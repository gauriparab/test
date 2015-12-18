/*global define:false*/
define([
    'jquery',
    'underscore',
    'views/workflows/presetsGridView',
    'models/targetRegionFile'
], function(
    $,
    _,
    PresetsGridView,
    TargetRegionFile
) {
    'use strict';

    /**
     * A re-usable presets grid view
     *
     * @type {*}
     */
    var TargetRegionFilePresetsGridView = PresetsGridView.extend({

        _url : '/ir/secure/api/v40/targetregions',

        _model : TargetRegionFile,

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

    return TargetRegionFilePresetsGridView;
});
