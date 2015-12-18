/*global define:false*/
define(['underscore', 'kendo', 'views/templateView', 'events/eventDispatcher', 'hb!templates/analysis/batch-analysis-summary.html'],
        function(_, kendo, TemplateView, dispatcher, template) {
        'use strict';

        var BatchAnalysisSummaryView = TemplateView.extend({
            initialize: function() {
                this.listenTo(dispatcher, 'updateBatchAnalysis', _.bind(this._updateBatchAnalysis, this));
            },
            
            render: function() {
                var invoiceJson = this._batchAnalysis.getInvoice() && this._batchAnalysis.getInvoice().toJSON();
                this.$el.html(template({
                    invoice: invoiceJson,
                    formattedInvoiceTotal: this._formatPrice(invoiceJson && invoiceJson.invoiceTotal)
                }));

                return this;
            },
            
            _formatPrice: function(price) {
                return price && kendo.toString(kendo.parseFloat(price, 'en-US'), 'c');
            },
            
            _updateBatchAnalysis: function(batchAnalysis) {
                this._batchAnalysis = batchAnalysis;
            }

        });

        return BatchAnalysisSummaryView;

    }
);
