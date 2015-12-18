/*global define:false*/
define([ 'backbone'], function(Backbone) {
	"use strict";
	var ModuleParameter = Backbone.Model.extend({
		toJSON : function() {
			var json = Backbone.Model.prototype.toJSON.call(this);
			json._cid = this.cid;
			json._key = this.get('key') && json.key && json.key.replace(/\./g, '-') || undefined;
			return json;
		}
	});

	return ModuleParameter;
});