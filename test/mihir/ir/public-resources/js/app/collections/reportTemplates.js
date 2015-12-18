/*global define:false*/
define(['backbone', 'models/reportTemplateModel'], function (Backbone, ReportTemplate) {
    'use strict';
    var ReportTemplates = Backbone.Collection.extend({
        model: ReportTemplate,
        url: '/ir/secure/api/rdxReportTemplate/getReportTemplates'
    });
    return ReportTemplates;
});