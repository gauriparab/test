/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var ClassificationSet = Backbone.Model.extend({
		url : '/ir/secure/api/rdxClassifications',
    	
    	methodUrl : {
    		'create' : '/ir/secure/api/rdxClassifications/createClassification'
    	},
    	
    	
    	sync: function(method, model, options) {
		    if (model.methodUrl && model.methodUrl[method.toLowerCase()]) {
	      		options = options || {};
	      		options.url = model.methodUrl[method.toLowerCase()];
	     	}
		    Backbone.sync(method, model, options);
		}
	});

	return ClassificationSet;
});