/*global define:false*/
define(['jquery',
        'underscore',
        'backbone',
        'events/eventDispatcher',
        'hb!templates/workflow-filters-select.html'].concat('bootstrap.select'),
        function($, _, Backbone, dispatcher, template) {
    'use strict';
    var FilterChainsCollectionView = Backbone.View.extend({

        initialize: function() {
            this.model = this.options.model || null;
            this.collection = this.options.collection || null;

            this.listenTo(this.collection, 'sync', this.render);
            this.listenTo(this.collection, 'add', this.render);
            dispatcher.on('filterChain:selectionChanged', _.bind(this._changeFilterSelection, this));
        },

        render: function() {
            var selectedFilterChain = this.model.getFilterChain();

            this.$el.html(template({
                filterChains: this.collection.toJSON()
            }));

            this.$('#selected-filter')
                .val(selectedFilterChain ? selectedFilterChain.get('id') : '')
                .selectpicker({ size : 5})
                .on('change', _.bind(this._selectionChanged, this));
            return this;
        },

        _changeFilterSelection: function() {
            var selectedFilterChain = this.model.getFilterChain();
            this.$('#selected-filter')
                .val(selectedFilterChain ? selectedFilterChain.get('id') : '')
                .selectpicker('refresh');
        },

        _selectionChanged: function(e) {
            var value = $(e.currentTarget).val();
            var selectedFilterChain = this.collection.get(value) || null;

            var existing = this.model.getFilterChain();
            // only update if we are changing to a new filter chain
            if (selectedFilterChain &&
                    (!existing || existing.id !== selectedFilterChain.id)) {
                selectedFilterChain.fetch({
                    success: _.bind(function(loadedFilterChain) {
                        this.model.setFilterChain(loadedFilterChain);
                    }, this)
                });
            }
            else if (selectedFilterChain !== existing) {
                this.model.setFilterChain(selectedFilterChain);
            }
        }

    });

    return FilterChainsCollectionView;
});