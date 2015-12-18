/*global define:false*/
define([ 'models/baseModel' ], function(BaseModel) {
	"use strict";

	var ControlQc = BaseModel.extend({
		urlRoot : '/ir/secure/api/assay/validateQC',
		
		fetch: function(options) {
			var self = this;
	        return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
	        	url: '/ir/secure/api/assay/getQC?id=' + self.attributes.assayId,
	            contentType: 'application/json'
	        }));
	    }
	});

	return ControlQc;

});
