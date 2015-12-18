/*global define:false*/
define(['underscore', 'models/baseModel', 'views/common/auditReasonView'], function(_, BaseModel, AuditReasonView) {

    'use strict';

    
    var SignOffModel = BaseModel.extend({

        urlRoot : '/ir/secure/api/signoff/save',

		sync: function(method, model, options) {
		    if (model.methodUrl && model.methodUrl[method.toLowerCase()]) {
	      		options = options || {};
	      		options.url = model.methodUrl[method.toLowerCase()];
	     	    }
		    /*if(method === 'create'){
		    	  AuditReasonView.open(function() {
		  			model.set("reason", document.getElementById("reason").value);
		  	    	    	Backbone.sync(method, model, options);
		  		    });
		    }else{
		    	Backbone.sync(method, model, options);
		    }*/
		    Backbone.sync(method, model, options);
		}
	});

    return SignOffModel;
});
