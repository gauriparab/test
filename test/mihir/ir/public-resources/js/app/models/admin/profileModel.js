/*global define:false*/
define([ 'backbone', 'jquery', 'underscore', "i18n", 'models/baseModel' ], function(Backbone, $, _, i18n, BaseModel) {

    'use strict';

   
    
    var ProfileModel = Backbone.Model.extend({
    	
        url : '/ir/secure/api/user/myprofile',
        
        methodUrl : {
            	'update' :'/ir/secure/api/user/updateEmail'
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

    return ProfileModel;
});
