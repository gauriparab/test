/*global define:false*/
define([ 'underscore', 'backbone', 'models/filter' ], function(_, Backbone, Filter) {

    "use strict";

    var FilterCollection = Backbone.Collection.extend({
        model : Filter,

        initialize: function(models, options) {
            options = options || {};
            this._analysisId = options.analysisId;
        },

        url: function() {
            /*if (this._analysisId) {
                return '/ir/secure/api/v40/analysis/' + this._analysisId + '/filters';
            } else {*/
                return '/ir/secure/api/filterChain/findAllFilters';
            //}
        },

        parse: function(response) {
            return _.filter(response, function(filter) {
                return _.contains([".filter.RangeFilter", ".filter.FixedLowRangeFilter",
                                   ".filter.SingleSelectFilter", ".filter.MultipleSelectFilter",
                                   ".filter.DynamicMultipleSelectFilter", ".filter.LogicalFilterGroup"], filter._type);
            });
        },

        fetch: function(options) {
            return Backbone.Collection.prototype.fetch.call(this, _.extend(options || {}, {
                contentType: 'application/json'
            }));
        }

    });

    return FilterCollection;
});
