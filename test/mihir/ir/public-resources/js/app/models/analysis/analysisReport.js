/*global define:false*/
define(['jquery', 'underscore', 'models/baseModel', 'models/analysis/analysisModel'], function($, _, BaseModel, AnalysisModel) {
    "use strict";

    var AnalysisReport = BaseModel.extend({
        urlRoot: '/ir/secure/api/v40/analysis_reports',

        parse: function(response) {
            response.analysis = new AnalysisModel(response.analysis, {parse: true});
            return response;
        },

        publish: function() {
            return $.ajax({
                type: "POST",
                url: '/ir/secure/api/v40/analysis_reports/publish',
                data: JSON.stringify(this.toJSON()),
                dataType: 'json',
                contentType: 'application/json'
            });
        },

        _getVariantDetailById: function(variantId) {
            var variantDetailsSection = this.get('variantDetailsSection'),
                reportedVariants = variantDetailsSection && variantDetailsSection.reportedVariants,
                reportedVariant = reportedVariants && _.findWhere(reportedVariants, {id: variantId});

            return reportedVariant;
        },

        setIncludedFlagForVariantAnnotation: function(variantId, annotationId, flag) {
            var variant = this._getVariantDetailById(variantId),
                annotation = variant && variant.annotations && _.findWhere(variant.annotations, {id: annotationId});

            annotation.included = flag;
        },

        setIncludedFlagForVariantComment: function(variantId, commentId, flag) {
            var variant = this._getVariantDetailById(variantId),
                comment = variant && variant.comments && _.findWhere(variant.comments, {id: commentId});

            comment.included = flag;
        }
    });

    return AnalysisReport;
});