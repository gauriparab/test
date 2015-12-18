/*global define:false*/
define(['jquery', 'backbone', 'hb!templates/filterChain/filter-edit-type-range.html' ],
function($, Backbone, template) {
    "use strict";

    /**
     * View for editing Range Filters
     */
    var FilterEditTypeRangeView = Backbone.View.extend({

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
            filter.set("configuredInclusive", this.$('#rangefilter-inclusive').prop('checked'));
            filter.set("configuredIncludeMissing", this.$('#rangefilter-includeUnannotated').prop('checked'));

            if (this.isInGroup()) {
                this.filter.set("enabled", this.isEnabled());
            }

            var from = this.$('#rangefilter-from').val();
            var to = this.$('#rangefilter-to').val();

            // autocorrect double range filters...
            if (filter.isDoubleRangeFilter()) {
                if (from.indexOf(".") === -1) {
                    from = from.concat(".0");
                }
                if (to.indexOf(".") === -1) {
                    to = to.concat(".0");
                }
            }

            filter.set("configuredRange", {
                "from": from,
                "to": to
            });
        },

        isValidFilter: function() {
            var filter = this.filter;

            var from = this._floatOrFalse(this.$('input#rangefilter-from').val());
            var to = this._floatOrFalse(this.$('input#rangefilter-to').val());

            if (!filter.isValueInRange(from) || !filter.isValueInRange(to)) {
                return false;
            }

            if (filter.isIntegerRangeFilter()) {
                if (!this._valueIsInteger(from) || !this._valueIsInteger(to)) {
                    return false;
                }
            }

            var inclusive = this.$('input#rangefilter-inclusive').prop('checked');
            if (inclusive && from > to) {
                return false;
            }
            if (!inclusive && from >= to) {
                return false;
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

    return FilterEditTypeRangeView;
});