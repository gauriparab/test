/*global define:false*/
define(['jquery', 'backbone', 'hb!templates/filterChain/filter-edit-type-select.html', 'bootstrap.select' ],
function($, Backbone, template) {
    "use strict";

    /**
     * View for editing Select Filters.
     */
    var FilterEditTypeSingleSelectView = Backbone.View.extend({

        initialize: function() {
            this.filter = this.options.filter;
        },

        render: function(isGroup) {
            this.$el.html(template({
                filter: this.filter,
                isGroup: isGroup
            }));
            this.$el.find('select').selectpicker();
            this.$el.find('select').selectpicker('val', this.filter.get('defaultValue'));
            return this;
        },

        prepareFilterForAdd: function() {
            this.filter.set('configuredValue', this.$el.find('select').val());
            this.filter.set("configuredIncludeMissing", this.$el.find('input#rangefilter-includeUnannotated').prop('checked'));

            if (this.isInGroup()) {
                this.filter.set("enabled", this.isEnabled());
            }
        },

        isValidFilter: function() {
            return this.$el.find('select').val() !== '';
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
            return this.$el.find('input#filter-select-enabled');
        }

    });
    return FilterEditTypeSingleSelectView;
});