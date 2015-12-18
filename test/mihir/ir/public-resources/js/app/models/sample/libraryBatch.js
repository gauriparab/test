/*global define:false*/
define(['models/baseModel', 'views/common/auditReasonView'], function(BaseModel, AuditReasonView) {

    'use strict';
    
    var Library = BaseModel.extend({
    	
    	initialize:function(options) {
    		options = options || {};
    		this.batchId = options.id;
    	},
    	
    	urlRoot : '/ir/secure/api/library/getEditBatchKits?batchId=',
    	
    	methodUrl : {
    		'create' : '/ir/secure/api/library/addLibraryBatch',
    		'update' : '/ir/secure/api/library/editLibraryBatch'
    	},
    	
    	url : function(){
       		return this.urlRoot+this.batchId;
        },
    	
    	sync: function(method, model, options) {
		    if (model.methodUrl && model.methodUrl[method.toLowerCase()]) {
	      		options = options || {};
	      		options.url = model.methodUrl[method.toLowerCase()];
	     	}
		    /*if(method === 'create' || method ==='update'){
		    	AuditReasonView.open(function() {
			  		model.set("reason", document.getElementById("reason").value);
			  	    Backbone.sync(method, model, options);
		  		});
		    } else{
		    	Backbone.sync(method, model, options);
		    }*/
		    Backbone.sync(method, model, options);
		}
    });

    return Library;
});
