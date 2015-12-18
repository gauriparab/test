/*global define:false*/
define(['jquery',
        'underscore',
        'collections/workflowFilterChains',
        'views/ParentView',
        'views/workflowFilterChainSelectionView',
        'views/filterValueListView',
        'views/filterChains/filterChainEditControlsView',
        'events/eventDispatcher',
        'hb!templates/workflow-filters.html'],
        function($,
                 _,
                 WorkflowFilterChainsCollection,
                 ParentView,
                 WorkflowFilterChainSelectionView,
                 FilterValueListView,
                 FilterChainEditControlsView,
                 dispatcher,
                 template) {
    "use strict";
    var WorkflowFiltersView = ParentView.extend({

        initialize: function() {
            this._filterChains = new WorkflowFilterChainsCollection();
            this._filterChainSelectionView = new WorkflowFilterChainSelectionView({
                model: this.model,
                collection: this._filterChains
            });
            this._filterChainEditControlsView = new FilterChainEditControlsView({
                filterChainDialogSelector: '#filterChain-dialog',
                filterChain: null,
                /** IR-6550 **/
                // beforePersistFilterChain: _.bind(this._beforeSavingFilterChain, this),
                onSuccessfulCreate: _.bind(this._onNewFilterChainCreated, this),
                onSuccessfulUpdate: _.bind(this._onFilterChainUpdated, this)
            });
            this.listenTo(this.model, 'change:filterChain', this._renderFilters);
        },

        render: function() {
            this.$el.html(template());
            this._filterChainEditControlsView.setElement(this.$('#filter-chain-controls')); //BUG : don't bind multiple view to same DOM el
            if (this._filterChains.length > 0) {
                this._renderFilterChains();
            } else {
                this._filterChains.getAllowed(this.model, _.bind(this._renderFilterChains, this));
            }
            return this;
        },

        /** IR-6550 **/
        //        _beforeSavingFilterChain: function(toSave) {
        //            toSave.getFilters().each(function(aFilter) {
        //                aFilter.unset('id');
        //            });
        //        },

        _onNewFilterChainCreated: function(newFilterChain) {
            this._filterChains.add(newFilterChain);
            this.model.setFilterChain(newFilterChain);
        },

        _onFilterChainUpdated: function(updatedFilterChain) {
            this.model.setFilterChain(updatedFilterChain);
            this._renderFilters();
        },

        _renderFilterChains: function() {
            this.renderSubView(this._filterChainSelectionView, '#filter-selection');
            this._renderFilters();
        },

        _renderFilters: function() {
            dispatcher.trigger('filterChain:selectionChanged', this.model.getFilterChain());
            var filterValueListView = new FilterValueListView({
                filterChain: this.model.getFilterChain() || null
            });
            this.renderSubView(filterValueListView, '#filters-list');
        }

    });

    return WorkflowFiltersView;
});
