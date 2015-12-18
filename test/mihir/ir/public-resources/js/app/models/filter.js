/*global define:false*/

define(['backbone', 'underscore', 'require']
        .concat('collections/filterCollection'), //Circular reference, needs later require()
    function(Backbone, _, require) {

    "use strict";
    var Filter = Backbone.Model.extend({

        urlRoot : '/ir/secure/api/v40/filters',
        parse: function(response) {
            var FilterCollection = require('collections/filterCollection');
            // create Filter objects for each filter in the group
            if (response._type === ".filter.LogicalFilterGroup") {
            	if(_.indexOf(response.filters, null)== -1) {
            		response.filters = new FilterCollection(response.filters, {parse: true});
            	}
            }
            return response;
        },

        fetch: function(options) {
            return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
                contentType: 'application/json'
            }));
        },

        isFixedLowRangeFilter: function() {
            return this.get("_type") === ".filter.FixedLowRangeFilter";
        },

        isRangeFilter: function() {
            return this.get("_type") === ".filter.RangeFilter";
        },
        
        isLogicalFilter: function() {
            return this.get('_type') === '.filter.LogicalFilterGroup'; 
        },

        isAnyRangeFilter: function() {
            return this.isRangeFilter() || this.isFixedLowRangeFilter();
        },

        isDoubleRangeFilter: function() {
            return this.isRangeFilter() && this._isDouble();
        }, 

        isIntegerRangeFilter : function() {
            return this.isRangeFilter() && !this._isDouble();
        }, 

        isDoubleFixedLowRangeFilter: function() {
            return this.isFixedLowRangeFilter() && this._isDouble();
        }, 

        isIntegerFixedLowRangeFilter : function() {
            return this.isFixedLowRangeFilter() && !this._isDouble();
        }, 

        _isDouble : function() {
            return this.get('canonical').from.indexOf(".") !== -1;
        },

        // note: inclusive property has absolutely nothing to do with this check.
        isValueInRange: function(value) {
            var canon = this.get("canonical"),
                from = parseFloat(canon.from),
                to = parseFloat(canon.to),
                v = parseFloat(value);
            return v >= from && v <= to;
        },

        /**
         * Looks at the filter to determine if it is configured to include missing variants or, in the case of 
         * logical filter groups, looks at the collection of included filters to determine if at least one filter is
         * configured as such.
         * 
         * @returns if the filter is configured to include variants without a matching value
         */
        getConfiguredIncludeMissing: function() {
            if (this.isLogicalFilter()) {
                return this.get('filters').any(function(filter) {
                    return filter.getConfiguredIncludeMissing();
                });
            }
            return this.get('configuredIncludeMissing');
        },

        /**
         * Looks at the filter to determine if it is configured to include missing variants or, in the case of
         * logical filter groups, looks at the collection of included filters to determine if at least one filter is
         * configured as such.
         *
         * @returns if the filter is configured to include variants without a matching value
         */
        getHandleMissing: function() {
            if (this.isLogicalFilter()) {
                return this.get('filters').any(function(filter) {
                    return filter.getHandleMissing();
                });
            }
            return this.get('handleMissing');
        },

        usable: true
    });

    return Filter;
});