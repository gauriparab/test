/*global define:false*/
define(['underscore', 'models/baseModel'], function(_, BaseModel) {

    'use strict';    
    var DefaultAttribute = BaseModel.extend({
	
        urlRoot : '/ir/secure/api/rdxReportTemplate/getDefaultCustomAttributes',
		
	  	initialize: function(){	  		
	    }	  
	});

    return DefaultAttribute;
});
