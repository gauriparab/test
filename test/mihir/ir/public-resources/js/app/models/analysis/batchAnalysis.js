/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'models/baseModel', 'models/batchresult/BatchResult', 'models/analysis/analysisModel',
        'models/analysis/purchase', 'models/analysis/purchaseOrder', 'models/analysis/invoice'],
        function($, _, Backbone, BaseModel, BatchResult, AnalysisModel, Purchase, PurchaseOrder, Invoice) {

    "use strict";

    var BatchAnalysis = BatchResult.extend({

        constructor: function(attrs, options) {
            BatchResult.call(this, attrs, _.extend(options || {}, {
                itemModel: AnalysisModel
            }));
        },

        parse: function(response) {
            response = BatchResult.prototype.parse.call(this, response);
            response.launchables = response.results.getSuccessfulResults().pluck('item');
            response.unlaunchables = response.results.getFailedResults().pluck('error');
            return response;
        },

        getInvoice: function() {
            return this._invoice;
        },

        setInvoice: function(invoice) {
            this._invoice = invoice;
        },

        getLaunchables: function() {
            return this.get('launchables') || [];
        },

        hasErrors: function() {
            return this.getFailedResults().length > 0;
        },

        getPurchaseOrder: function() {
            return this._invoice && this._invoice.get('purchaseOrder') || new PurchaseOrder();
        },

        fetchBatchAnalyses: function(batchAnalysisFile, onSuccess, onError) {
            var url = '/ir/secure/api/v40/batch_analysis/analyses_ready_to_launch';
            return this.fetch({
                url: url,
                data: JSON.stringify(batchAnalysisFile.toJSON()),
                dataType: 'json',
                type: 'POST',
                contentType: 'application/json',
                success : _.bind(this._purchaseAnalyses, this, onSuccess, onError),
                error : onError,
                reset : true,
                noGlobalErrorHandler: false,
                timeout: parseInt($.t('analysis.error.timeout.value'), 10)
            });
        },

        _purchaseAnalyses: function(onSuccess, onError) {
            var purchase = new Purchase(),
                launchables = this.get('launchables');
            if (launchables && launchables.length > 0) {
                purchase.purchaseAnalyses(
                        _.map(launchables, function(analysis) {
                            return new AnalysisModel(analysis);
                        }),
                        new PurchaseOrder(),
                        _.bind(this._successfulPurchase, this, onSuccess),
                        _.bind(this._failedPurchase, this, onError));
            } else if (_.isFunction(onSuccess)) {
                onSuccess(this);
            }
        },

        _successfulPurchase: function(callback, purchase, response) {
            this._invoice = new Invoice(response.invoice || {});
            if (_.isFunction(callback)) {
                callback(this);
            }
        },

        _failedPurchase: function(callback) {
            if (_.isFunction(callback)) {
                callback(this);
            }
        }

    });

    return BatchAnalysis;
});
