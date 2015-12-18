/*global define:false */
define(['jquery', 'underscore', 'kendo', 'views/templateView', 'models/filterChain',
    'hb!templates/filterChain/filterChain-detail.html', 'hb!templates/grid/grid-column-locked.html',
    'hb!templates/grid/grid-column-provided.html', 'hb!templates/filterChain/filters-list.html',
    'utils/filterDisplayHandler'],

    function($, _, kendo, TemplateView, FilterChain, template, lockedColumnTemplate, providedColumnTemplate,
        filtersListTemplate, FilterDisplayHandler) {

        'use strict';

        /**
         * A view of FilterChain details
         *
         * @type {*}
         */
        var FilterChainDetailView = TemplateView.extend({

            template: template,

            _subTemplates: {
                locked: lockedColumnTemplate,
                provided: providedColumnTemplate,
                filtersList: filtersListTemplate
            },

            initialize: function() {
                if (this.model) {
                    this.model.on('refresh', this.render, this);
                }
            },
            
            /**
             * Render the template inside container.
             */
            render: function() {
                this.$el.html(this.template(_.extend(this._modelToJSON(), {
                    sub: this._subTemplates
                })));
                this.$('[data-toggle=tooltip]').tooltip();
            },

            /**
             * Custom filterChain serialization for this view.
             *
             * @returns {*}
             * @private
             */
            _modelToJSON: function() {
                var self = this;
                var filters = this.model.get("filters").map(function(filter) {
                    return {
                        id: filter.id,
                        type: filter.get('_type'),
                        name: filter.get('name'),
                        displayValue: self._getFilterDisplayValue(filter.toJSON()),
                        includeMissing: filter.getConfiguredIncludeMissing() || false,
                        handleMissing: filter.getHandleMissing() || false
                    };
                });

                var json = this.model.toJSON();
                json.filters = filters;
                return _.defaults(_.extend(json, {
                    // fields here that override the default values
                    creator: json.createdBy && json.createdBy.lastName + ', ' + json.createdBy.firstName,
                    createdOn: json.createdOn && kendo.toString(new Date(Date.parse(json.createdOn)), 'MMM dd yyyy hh:mm tt')

                }), {
                    // default values here to apply in case of null
                    name : '',
                    description : '',
                    creator: ''
                });
            },

            _getFilterDisplayValue: function(filter) {
                return new FilterDisplayHandler().getFilterDisplayValue(filter);
            }

        });

        return FilterChainDetailView;

    }
);
