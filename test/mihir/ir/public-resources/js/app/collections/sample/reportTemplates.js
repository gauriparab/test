/*global define:false*/
define(['models/reportTemplateModel','backbone'], function(ReportTemplate,Backbone) {

    'use strict';
    var ReportTemplates = Backbone.Collection.extend({
		url:'/ir/secure/api/planrun/getTemplateReportsFromAssay?assayId=',
		model: ReportTemplate,
		initialize:function(options){
			this.url+=options.id;
		}
    });

    return ReportTemplates;
});