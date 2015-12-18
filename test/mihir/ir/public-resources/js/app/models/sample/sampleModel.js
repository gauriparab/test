/*global define:false*/
define(['underscore', 'models/baseModel', 'views/common/auditReasonView'], function(_, BaseModel, AuditReasonView) {

    'use strict';

    
    var SampleModel = BaseModel.extend({

        urlRoot : '/ir/secure/api/samplemanagement/samples/',

        methodUrl: {
    	    'create': '/ir/secure/api/samplemanagement/samples/addSample',
    	    'update': '/ir/secure/api/samplemanagement/samples/editSample'
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
		    if(method === 'create' || method ==='update'){
		    	  AuditReasonView.open(function() {
		  			model.set("reason", document.getElementById("reason").value);
		  	    	    	Backbone.sync(method, model, options);
		  		    });
		    }else{
		    	Backbone.sync(method, model, options);
		    }
		}
	});

    return SampleModel;
});
