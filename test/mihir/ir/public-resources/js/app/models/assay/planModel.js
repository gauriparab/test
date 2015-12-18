/*global define:false*/
define(['underscore', 'models/baseModel'], function(_, BaseModel) {

    'use strict';

    
    var PlanModel = BaseModel.extend({

        urlRoot : '/ir/secure/api/planrun',

        methodUrl: {
    	    'create': '/ir/secure/api/planrun/createPlanRun',
        },
  	
	  	initialize: function(options){
	  		if(options!=undefined){
	  			this.sampleId = options.sampleId;
	  		}
	    },
	    url : function(){
	    	if(this.sampleId!=undefined){
	    		//return this.urlRoot+"?id="+this.sampleId;
	    		return '/ir/secure/api/data/sample?sampleId='+this.sampleId;
	    	}else{
	    		return this.urlRoot;
	    	}
	     },

		sync: function(method, model, options) {
		    if (model.methodUrl && model.methodUrl[method.toLowerCase()]) {
	      		options = options || {};
	      		options.url = model.methodUrl[method.toLowerCase()];
	     	    }
		    	Backbone.sync(method, model, options);
		}
	});

    return PlanModel;
});
