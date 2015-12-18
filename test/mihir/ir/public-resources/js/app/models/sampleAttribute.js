/*global define:false*/
define(['jquery', 'underscore', 'models/baseModel', 'views/common/auditReasonView'], function($, _, BaseModel, AuditReasonView) {

    "use strict";

    var SampleAttribute = BaseModel.extend({        
        urlRoot: '/ir/secure/api/attributes/',
	
	methodUrl: {
            'create': '/ir/secure/api/attributes/addAttribute',
            'update': '/ir/secure/api/attributes/editAttribute'
        },

        sync: function(method, model, options) {
            if (model.methodUrl && model.methodUrl[method.toLowerCase()]) {
                options = options || {};
                options.url = model.methodUrl[method.toLowerCase()];
            }
	    	Backbone.sync(method, model, options);
        }        
    });

    return SampleAttribute;
});
