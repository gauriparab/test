/*global define:false*/
define(['underscore', 'jquery', 'backbone', 'hb!templates/filterChain/filter-chain-edit-filter.html','models/filter',
    'views/ParentView', 'views/filterChains/filterSelectionView',
    'views/filterChains/filterResolver'],
function(_, $, Backbone, template, Filter, ParentView, FilterSelectionView, FilterResolver) {
    "use strict";

    var Event = {
        FILTER_VALUE_SELECTION_CHANGED: 'filterValueSelectionChanged'
    };

    var FilterView = ParentView.extend({

        // used to track the view that is currently being used for filter editing
        _currentEditView: null,

        initialize: function() {

            this.filterChain = this.model || null;
            this.availableFilters = this.collection || null;
            this._selectedFilter = this.options.selectedFilter || new Filter();

            this.listenTo(this._selectedFilter, 'change:id', this._renderSelection);

            this.filterSelectionView = new FilterSelectionView({
                collection: this.availableFilters,
                model: this.filterChain,
                selectedFilter: this._selectedFilter
            });

        },

        render: function() {

            this.$el.html(template({
                selected : this._selectedFilter
            }));

            this.renderSubView(this.filterSelectionView, "#filter-chain-edit-filter-select");

            return this;
        },

        _renderSelection: function() {
            var selected = this._selectedFilter;
            if (selected) {
                var selector = this.$el.find('.filter-chain-filter-btn-configure');

                // multi-selects control the set button (alignment) in their own templates...
                if (selected.get('_type') === '.filter.DynamicMultipleSelectFilter' ||
                    selected.get('_type') === '.filter.MultipleSelectFilter') {
                    selector = selector.not('#filter-chain-edit-filter-main-button');
                    this.$el.find('#filter-chain-edit-filter-main-button').hide();
                }
                selector.show();
                var editView = this._findViewForType(selected.get('_type'));
                var container = this.$el.find('#filter-chain-edit-filter-container');
                if (this._currentEditView) {
                    this.stopListening(this._currentEditView);
                    this._currentEditView.remove();
                }
                var node = $('<div></div>').appendTo(container);
                this._currentEditView = new editView({
                    el: node,
                    filter: selected
                });
                this.listenTo(this._currentEditView, Event.FILTER_VALUE_SELECTION_CHANGED, this._onFilterValueSelectionChanged);
                this._currentEditView.render();
            }
        },

        // find the view class used to edit the given filter
        _findViewForType: function(type) {
            return FilterResolver.viewForType(type);
        },

        _onFilterValueSelectionChanged: function() {
            this.trigger(Event.FILTER_VALUE_SELECTION_CHANGED);
        },

        isValidFilter: function(filter) {
            // delegate to the current edit view
            if (this._currentEditView) {
                return this._currentEditView.isValidFilter(filter);
            }
            return false;
        },

        prepareFilterForAdd: function(filter) {
            if (this._currentEditView) {
                this._currentEditView.prepareFilterForAdd(filter);
            }
        }

    });

    FilterView.Event = Event;

    return FilterView;
});