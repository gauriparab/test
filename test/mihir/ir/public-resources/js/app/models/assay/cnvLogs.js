/*global define:false*/
define(['models/baseModel'], function(BaseModel) {
    'use strict';
    
    var Control = BaseModel.extend({
    	
    	url: '/ir/secure/api/cnv/showCnvLogs?id=',
    	
    	initialize: function(options) {
    		this.url += options.id;
    	}
    });
    
    return Control;
});
