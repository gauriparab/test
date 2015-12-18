/*global define:false*/
define([
    'jquery',
    'underscore',
    'views/workflows/presetsGridView',
    'models/filterChain'
], function(
    $,
    _,
    PresetsGridView,
    FilterChain
) {
    'use strict';

    /**
     * A re-usable presets grid view
     *
     * @type {*}
     */
    var FilterChainPresetsGridView = PresetsGridView.extend({

        _url : '/ir/secure/api/v40/filterChains',

        _model : FilterChain,

        _fields: _.extend({}, PresetsGridView.prototype.fields, {
            filters: {
                type: 'array'
            }
        })

    });

    return FilterChainPresetsGridView;
});
