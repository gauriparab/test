/*global define:false*/
define(['underscore', 'models/baseModel'], function(_, BaseModel) {

    'use strict';
    
    var Summary = BaseModel.extend({
    	initialize: function(options){
    		if(options && options.url){
    			this.url = options.url + "?resultId=" + options.resultId;
    		}
    	}
    });

    return Summary;
    
});
