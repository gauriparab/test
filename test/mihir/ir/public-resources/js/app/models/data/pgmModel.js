/*global define:false*/
define(['underscore', 'models/baseModel'], function(_, BaseModel) {

    'use strict';

    
    var OTModel = BaseModel.extend({

        urlRoot : '/ir/secure/api/data/pgm?resultId=',

        initialize: function(options){
        	this.pgmId= options.pgmId;
        },
        url : function(){
    	      return this.urlRoot+this.pgmId;
         },

	sync: function(method, model, options) {
	    if (model.methodUrl && model.methodUrl[method.toLowerCase()]) {
      		options = options || {};
      		options.url = model.methodUrl[method.toLowerCase()];
     	    }
    	    Backbone.sync(method, model, options);
	}
    });

    return OTModel;
    
});
