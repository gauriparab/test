/*global define:false*/
define([ 'backbone', 'underscore', 'collections/moduleParameters' ], 
    function(Backbone, _, ModuleParameterCollection) {
	"use strict";
	var Module = Backbone.Model.extend({

		url: "/ir/secure/api/assay/validateParameters",
		
		initialize : function() {
			if (this.attributes.parameters && !(this.attributes.parameters instanceof ModuleParameterCollection)) {
				this.attributes.parameters = new ModuleParameterCollection(this.attributes.parameters);
			}
		},

		toJSON : function() {
			var json = Backbone.Model.prototype.toJSON.call(this);
			json._cid = this.cid;
            json.parameters =
                json.parameters instanceof ModuleParameterCollection ?
                    json.parameters.toJSON() : json.parameters;
			return json;
		},

		parse : function(response) {
			response.parameters = new ModuleParameterCollection(response.parameters);
			return response;
		},
		fetch: function(options) {
			var self = this;
	        return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
	        	url: '/ir/secure/api/assay/getParameters?id=' + self.attributes.assayId,
	            contentType: 'application/json'
	        }));
	    }
	});

	return Module;
});