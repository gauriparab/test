/*global define:false*/
define(['underscore', 'models/baseModel'], function(_, BaseModel) {

    'use strict';    
    var ReportTemplateModel = BaseModel.extend({
	
        url : '/ir/secure/api/rdxReportTemplate/getReportTemplate?id=',
		
	  	initialize: function(options){	 
	  		this.url += options.id;
	    }	  
	});

    return ReportTemplateModel;
});
