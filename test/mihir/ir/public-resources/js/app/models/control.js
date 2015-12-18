/*global define:false*/
define([ 'models/baseModel' ], function(BaseModel) {
	"use strict";

	var Control = BaseModel.extend({
		urlRoot : '/ir/secure/api/assay/validateControls',
		
		initialize: function(options) {
			this.options=options || {}
		},
		
		fetch: function(options) {
			var self = this;
			var url='/ir/secure/api/assay/getControls?id=' + self.attributes.assayId+"&controlKitId="+this.options.controlKitId+"&templateKitId="+this.options.templateKitId+"&sequenceKitId="+this.options.sequenceKitId;
	        return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
	        	url: url,
	            contentType: 'application/json'
	        }));
	    }
	});

	return Control;

});
