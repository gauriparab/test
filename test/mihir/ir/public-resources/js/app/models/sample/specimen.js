/*global define:false*/
define(['models/baseModel', 'views/common/auditReasonView'], function(BaseModel, AuditReasonView) {

    'use strict';
    
    var Specimen = BaseModel.extend({
    	url : '/ir/secure/api/specimen',
    	
    	methodUrl : {
    		'create' : '/ir/secure/api/specimen/add',
    		'update' : '/ir/secure/api/specimen/edit'
    	},
    	
    	initialize:function(options){
    	},
    	
    	sync: function(method, model, options) {
		    if (model.methodUrl && model.methodUrl[method.toLowerCase()]) {
	      		options = options || {};
	      		options.url = model.methodUrl[method.toLowerCase()];
	     	}
		    Backbone.sync(method, model, options);
		}
    });

    return Specimen;
});
