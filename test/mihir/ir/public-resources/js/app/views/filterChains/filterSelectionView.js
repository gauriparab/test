/*global define:false*/
define(['underscore', 'jquery', 'backbone', 'views/ParentView',
    'hb!templates/filterChain/filter-chain-edit-filter-select.html'],
function(_, $, Backbone, ParentView, template) {

    "use strict";

    var FilterSelectionView = ParentView.extend({

        initialize: function() {
            this.availableFilters = this.collection || null;
            this.filterChain = this.model || null;
            this._selectedFilter = this.options.selectedFilter;
            this.listenTo(this.availableFilters, 'sync', this.render);
        },

        events: {
            'change select#filter-select': 'selectionChanged'
        },

        render: function() {

            this.$el.html(template({
                filters: this.availableFilters.models
            }));

            var selectedId = this._selectedFilter.id;
            if (selectedId) {
                this.$el.find('select#filter-select').val(selectedId);
            } else {
                this.$el.find('select#filter-select').val('');
            }

            return this;

        },

        selectionChanged: function(e) {
            e.preventDefault();
            var value = $(e.currentTarget).val();

            var selectedFilter = this._configuredOrFactory(this.availableFilters.get(value));
            if (selectedFilter && selectedFilter.attributes) {
                this._selectedFilter.id = selectedFilter.id;
                this._selectedFilter.cid = selectedFilter.cid;
                this._selectedFilter.set(selectedFilter.attributes);
            }
        },

        _configuredOrFactory: function(factoryFilter) {
            var configuredFilter = this.filterChain.get("filters").findWhere({name: factoryFilter.get("name")});
            return configuredFilter || factoryFilter;
        }
    });

    return FilterSelectionView;
});