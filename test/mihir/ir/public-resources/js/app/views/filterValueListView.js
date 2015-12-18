/*global define:false*/
define(['jquery',
        'underscore',
        'backbone',
        'utils/filterDisplayHandler',
        'hb!templates/filterChain/filterChain-detail.html',
        'hb!templates/grid/grid-column-locked.html',
        'hb!templates/grid/grid-column-provided.html',
        'hb!templates/filterChain/filters-list.html'],

    function($,
             _,
             Backbone,
             FilterDisplayHandler,
             template,
             lockedColumnTemplate,
             providedColumnTemplate,
             filtersListTemplate) {

        'use strict';

        var FiltersView = Backbone.View.extend({

            _template: template,

            _subTemplates: {
                locked: lockedColumnTemplate,
                provided: providedColumnTemplate,
                filtersList: filtersListTemplate
            },

            initialize: function() {
                this._filterChain = this.options.filterChain || null;
            },

            render: function() {
                var filterDisplayHandler = new FilterDisplayHandler();
                var json = _.extend({},
                    { sub: this._subTemplates },
                    this._filterChain && this._filterChain.toJSON(),
                    this._filterChain && {
                        filters: this._filterChain.get('filters').map(function(filter) {
                            return {
                                id: filter.get('id'),
                                type: filter.get('_type'),
                                name: filter.get('name'),
                                displayValue: filterDisplayHandler.getFilterDisplayValue(filter.toJSON()),
                                includeMissing: filter.getConfiguredIncludeMissing(),
                                handleMissing: filter.getHandleMissing() || false
                            };
                        })
                    });
                this.$el.html(this._template(json));
                this.$('[data-toggle=tooltip]').tooltip();
                return this;
            }

        });

        return FiltersView;
    }
);