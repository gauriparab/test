/*global define:false*/
define(['underscore', 'models/baseModel'], function(_, BaseModel) {

    'use strict';    
    var PresetsModel = BaseModel.extend({
	
        urlRoot : '/ir/secure/api/rdxReportTemplate/createRdxReportTemplate',
		
	  	initialize: function(){	  		
	    }	  
	});

    return PresetsModel;
});
