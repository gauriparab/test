/* global define:false */
define(['jquery',
        'underscore',
        'collections/variantsFilterMetricsCollection',
        'events/eventDispatcher',
        'views/templateView',
        'utils/filterDisplayHandler',
        'hb!templates/variants/variants-summaries.html']
        .concat('bootstrap.select'),
        function($,
                 _,
                 VariantsFilterMetricsCollection,
                 dispatcher,
                 TemplateView,
                 FilterDisplayHandler,
                 variantsSummariesTemplate) {
    'use strict';

    var VariantsSummariesView = TemplateView.extend({
        _template: variantsSummariesTemplate,

        initialize: function(opts) {
            var options = opts || {};
            this._variantsSearchContext = options.variantsSearchContext;
        },

        delegateEvents: function() {
            TemplateView.prototype.delegateEvents.apply(this, arguments);
            this.listenTo(dispatcher, 'variantsgrid:OnAfterParse', this._renderFilters);
        },

        undelegateEvents: function() {
            this.stopListening(dispatcher, 'variantsgrid:OnAfterParse', this._renderFilters);
            TemplateView.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
            this._renderNoFilters();
        },

        _renderFilters: function(response) {
            if (_.isUndefined(response)) {
                this._getFilterMetrics();
            } else {
                this._renderFiltersWithResponse(response);
            }
        },

        _renderFiltersWithResponse: function(response) {
            this.$el.html(this._template(this._adaptFilterMetricsResponse(response)));
            this.$('[data-toggle=tooltip]').tooltip();
        },

        _renderNoFilters: function() {
            this.$el.html(this._template({
                filtersMetrics: []
            }));
        },

        _adaptFilterMetricsResponse: function(response) {
            //IR-7504: extract the total variants out of the response
            var totalVariants =  response.totalVariantsCalled;

            response.filterMetrics = response.filterMetrics || [];
            var filterDisplayHandler = new FilterDisplayHandler();
            var totalGenes =  _.reduce(response.filterMetrics, function (acc, filterMetric) {
                return acc + filterMetric.totalGenesPassed;
            }, 0);
            
            var filtersMetrics = _.map(response.filters, function(filterMetric) {
            	return {
            		filter :{
                        id: filterMetric.id,
                        type:filterMetric._type,
                        name: filterMetric.name,
                        displayValue: filterDisplayHandler.getFilterDisplayValue(filterMetric),
                        includeMissing : filterDisplayHandler.getFilterIncludeMissing(filterMetric),
                        handleMissing : filterDisplayHandler.getFilterHandleMissing(filterMetric) || false
                    },
                    totalGenesPassed: filterMetric.totalGenesPassed,
                    totalVariantsPassed: filterMetric.totalVariantsPassed
            	}
            	
            });

            var json = {
                filtersMetrics: filtersMetrics,
                totalGenes: totalGenes,
                totalVariants: totalVariants
            };
            return json;
        },

        _getFilterMetrics: function() {
            var self = this;
            var filterChainId= this._variantsSearchContext.toSlimJSON().variantCriteria.filterChain.id;
            $.ajax({
                url: '/ir/secure/api/data/getFilterSummary?filterChainId='+filterChainId,
                type: 'GET',
                contentType: 'application/json',
                timeout: 30000,
                success: function(response) {
                    self._renderFiltersWithResponse(response);
                }
            });
        }
    });

    return VariantsSummariesView;

});
