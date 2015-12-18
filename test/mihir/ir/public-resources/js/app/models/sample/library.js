/*global define:false*/
define(['models/baseModel', 'views/common/auditReasonView'], function(BaseModel, AuditReasonView) {

    'use strict';
    
    var Library = BaseModel.extend({
    	url : '/ir/secure/api/library',
    	
    	methodUrl : {
    		'create' : '/ir/secure/api/library/addLibraryprep',
    		'update' : '/ir/secure/api/library/editLibraryprep'
    	},
    	
    	initialize:function(options){
    		this.needsReason = options.reason;
    	},
    	
    	sync: function(method, model, options) {
		    if (model.methodUrl && model.methodUrl[method.toLowerCase()]) {
	      		options = options || {};
	      		options.url = model.methodUrl[method.toLowerCase()];
	     	}
		    if(method === 'create' || method ==='update'){
		    	if(this.needsReason){
			    	AuditReasonView.open(function() {
				  		model.set("reason", document.getElementById("reason").value);
				  	    Backbone.sync(method, model, options);
			  		});
		    	} else {
		    		Backbone.sync(method, model, options);
		    	}
		    } else{
		    	Backbone.sync(method, model, options);
		    }
		}
    });

    return Library;
});
