/*global define:false*/
define(['models/baseModel'], function(BaseModel) {
    'use strict';
    var GeneToReport = BaseModel.extend({
    	url: '/ir/secure/api/rdxReportTemplate/getGeneList?assayId=',
    	initialize: function(options) {
    		this.url += options.id;
    	}
    });
    
    return GeneToReport;
});
