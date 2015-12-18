/*global define:false*/
define(['jquery', 'backbone', 'hb!templates/filterChain/filter-edit-type-fixed-low-range.html' ],
function($, Backbone, template) {
    "use strict";

    /**
     * View for editing Range Filters
     */
    var FilterEditTypeFixedLowRangeView = Backbone.View.extend({

        initialize: function() {
            this.filter = this.options.filter;
        },

        render: function(isGroup) {
            this.$el.html(template({
                filter: this.filter,
                isGroup: isGroup
            }));
            return this;
        },

        prepareFilterForAdd: function() {
            var filter = this.filter;
            filter.set("configuredInclusive", this.$el.find('input#rangefilter-inclusive').prop('checked'));
            filter.set("configuredIncludeMissing", this.$el.find('input#rangefilter-includeUnannotated').prop('checked'));

            if (this.isInGroup()) {
                this.filter.set("enabled", this.isEnabled());
            }

            var high = this.$el.find('input#rangefilter-high').val();
            // autocorrect double range filters...
            if (filter.isDoubleFixedLowRangeFilter()) {
                if (high.indexOf(".") === -1) {
                    high = high.concat(".0");
                }
            }
            filter.set("configuredHigh", high);
        },

        isValidFilter: function() {
            var filter = this.filter;
            var high = this._floatOrFalse(this.$el.find('input#rangefilter-high').val());
            if (!filter.isValueInRange(high)) {
                return false;
            }

            if (filter.isIntegerFixedLowRangeFilter()) {
                if (!this._valueIsInteger(high)) {
                    return false;
                }
            }
            return true;
        },

        isInGroup: function() {
            // we know it's part of a group if the checkbox is present.
            var $enabledCheckbox = this._getEnabledCheckbox();
            return $enabledCheckbox && $enabledCheckbox.length > 0;
        },

        isEnabled: function() {
            return this._getEnabledCheckbox().prop('checked');
        },

        _getEnabledCheckbox: function() {
            return this.$el.find('input#rangefilter-enabled');
        },

        _valueIsInteger: function(value) {
            return value % 1 === 0;
        },

        _floatOrFalse: function(n) {
            var floatValue = parseFloat(n);
            if (!isNaN(floatValue) && isFinite(n)) {
                return floatValue;
            } else {
                return false;
            }
        }

    });

    return FilterEditTypeFixedLowRangeView;
});