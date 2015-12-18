/*global define:false*/
define([ 'underscore', 'backbone', 'models/finalReportSection', 'models/finalReportSection/headerSection',
        'models/finalReportSection/analysisInformationSection', 'models/finalReportSection/backgroundSection',
        'models/finalReportSection/disclaimerSection', 'models/finalReportSection/reportedVariantsSection',
        'models/finalReportSection/samplesOverviewSection', 'models/finalReportSection/signOffSection',
        'models/finalReportSection/variantDetailsSection', 'models/finalReportSection/commentsSection' ], 
        function(_, Backbone, FinalReportSection, HeaderSectionModel, AnalysisInformationSectionModel, BackgroundSectionModel,
        DisclaimerSectionModel, ReportedVariantsSectionModel, SamplesOverviewSectionModel, SignOffSectionModel,
        VariantDetailsSectionModel, CommentsSectionModel) {

    "use strict";

    var SUPPORTED_TYPES = [ "AnalysisInformationSection", "BackgroundSection", "DisclaimerSection", "HeaderSection",
            "ReportedVariantsSection", "SamplesOverviewSection", "SignOffSection", "VariantDetailsSection",
            "CommentsSection" ];
    var MODEL_TYPES = {
        HeaderSection : HeaderSectionModel,
        AnalysisInformationSection : AnalysisInformationSectionModel,
        BackgroundSection : BackgroundSectionModel,
        DisclaimerSection : DisclaimerSectionModel,
        ReportedVariantsSection : ReportedVariantsSectionModel,
        SamplesOverviewSection : SamplesOverviewSectionModel,
        SignOffSection : SignOffSectionModel,
        VariantDetailsSection : VariantDetailsSectionModel,
        CommentsSection : CommentsSectionModel
    };

    var FinalReportSectionCollection = Backbone.Collection.extend({
        model : function(attrs, options) {
            var model = attrs && attrs._type && MODEL_TYPES[attrs._type] || undefined;
            if (model) {
                return new model(attrs, options);
            } else {
                return new FinalReportSection(attrs, options);
            }
        },

        url : '/ir/secure/api/v40/finalreporttemplates/allowed/reportsections',

        parse : function(response) {
            return _.filter(response, function(finalReportSection) {
                return _.contains(SUPPORTED_TYPES, finalReportSection._type);
            });
        },

        fetch : function(options) {
            return Backbone.Collection.prototype.fetch.call(this, _.extend(options || {}, {
                contentType : 'application/json'
            }));
        }

    });

    return FinalReportSectionCollection;
});