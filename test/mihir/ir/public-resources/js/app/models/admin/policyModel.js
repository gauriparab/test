/*global define:false*/
define([ 'backbone', 'jquery', 'underscore', "i18n", 'models/baseModel' ], function(Backbone, $, _, i18n, BaseModel) {

    'use strict';

   
    
    var PolicyModel = Backbone.Model.extend({
    	
    	url : '/ir/secure/policies/default',
    	
         methodUrl : {
         	'create' :'/ir/secure/policies/update'
         },
     
         sync: function(method, model, options) {
		    if (model.methodUrl && model.methodUrl[method.toLowerCase()]) {
	      		options = options || {};
	      		options.url = model.methodUrl[method.toLowerCase()];
	     	} else {
		    	options.url= this.url;
		    }
		    Backbone.sync(method, model, options);
		}

       
    });

    return PolicyModel;
});
