/*global define:false*/
define(['underscore', 'jquery', 'backbone', 'utils/filterDisplayHandler', 'hb!templates/filterChain/filters-selected.html'],
        function(_, $, Backbone, FilterDisplayHandler, template) {

    "use strict";

    var SelectedFiltersView = Backbone.View.extend({

        initialize: function() {
            this.filterChain = this.model || null;
            this._filters = this.filterChain.get('filters');
            this.listenTo(this._filters, 'add', this.render);
            this.listenTo(this._filters, 'remove', this.render);
            this.listenTo(this._filters, 'change', this.render);
        },

        render: function() {
            var self = this;
            var filters = this._filters.map(function(filter) {
                return {
                    cid: filter.cid,
                    id: filter.id,
                    type: filter.get("_type"),
                    name: filter.get("name"),
                    displayValue: self._getFilterDisplayValue(filter.toJSON()),
                    includeMissing: filter.getConfiguredIncludeMissing() || false,
                    handleMissing: filter.getHandleMissing() || false
                };
            });

            this.$el.html(template({
                filters: filters
            }));
            this.$('[data-toggle=tooltip]').tooltip();
            return this;
        },

        _getFilterDisplayValue: function(filter) {
            var filterHandler = new FilterDisplayHandler().selectFilterHandler(filter);
            var filterExpr = null;
            if (filterHandler) {
                filterExpr = filterHandler._filterExpr(filter);
                if (filterExpr) {
                    return filterExpr;
                } else {
                    return _getUndefinedFilter(filter.name);
                }
            } else {
                return 'Unknown filter';
            }
        }

    });

    function _getUndefinedFilter(name) {
        return name + ' is undefined';
    }


    return SelectedFiltersView;
});
