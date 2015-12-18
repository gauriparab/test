/*global define:false*/
define(['jquery', 'underscore', 'views/templateView', 
        'views/analysis/batchAnalysesGridView', 'views/analysis/batchAnalysesUploadErrorsGridView', 
        'views/analysis/batchAnalysisSummaryView', 'views/analysis/batchAnalysisErrorDetailsView', 
        'events/eventDispatcher', 'hb!templates/analysis/batch-analysis-with-errors.html', 
        'hb!templates/analysis/batch-analysis-no-errors.html'], 
        function($, _, TemplateView, BatchAnalysesGridView, BatchAnalysesUploadErrorsGridView, 
                BatchAnalysisSummaryView, BatchAnalysisErrorDetailsView, dispatcher, 
                templateWithErrors, templateWithoutErrors) {
    'use strict';

    var BatchAnalysesView = TemplateView.extend({
        initialize: function() {
            this._batchAnalysesGridView = new BatchAnalysesGridView();

            this._batchUploadErrorsGridView = new BatchAnalysesUploadErrorsGridView();

            this._batchAnalysisSummaryView = new BatchAnalysisSummaryView();
            this._batchAnalysisErrorDetailsView = new BatchAnalysisErrorDetailsView();

            this.listenTo(dispatcher, 'updateBatchAnalysis', _.bind(this._updateBatchAnalysis, this));
            this._batchUploadErrorsGridView.on('rowSelect', this._updateErrorDetails, this);
        },

        render: function() {
            if (this._batchAnalysis.hasErrors()) {
                this.$el.html(templateWithErrors());

                this.renderSubView(this._batchUploadErrorsGridView, '#batch-analyses-error-grid');
                this.renderSubView(this._batchAnalysisErrorDetailsView, '#batch-entry-error-details');
            } else {
                this.$el.html(templateWithoutErrors());
            }

            this.renderSubView(this._batchAnalysesGridView, '#batch-analyses-grid');
            this.renderSubView(this._batchAnalysisSummaryView, '#batch-summary');

            return this;
        },

        _updateBatchAnalysis: function(batchAnalysis) {
            this._batchAnalysis = batchAnalysis;
            this._batchAnalysesGridView.setBatchAnalysis(batchAnalysis);
            this._batchUploadErrorsGridView.setBatchAnalysis(batchAnalysis);
        },
        
        _updateErrorDetails: function(errors) {
            this._batchAnalysisErrorDetailsView.setErrors(errors);
            this.renderSubView(this._batchAnalysisErrorDetailsView, '#batch-entry-error-details');
        }
    });

    return BatchAnalysesView;

});