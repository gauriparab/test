/*global define:false*/
define(['underscore', 'models/baseModel'], function(_, BaseModel) {

    'use strict';
	
    
    var AuditTrailModel = BaseModel.extend({
	
	url: function() {
	    return this.detailsViewUrl;
	},

	initialize: function(options) {
	  // this._url = options.detailsViewUrl
	  this.detailsViewUrl=options.detailsViewUrl
	}
    });

    return AuditTrailModel;
});
