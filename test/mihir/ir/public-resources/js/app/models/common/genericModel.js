/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var AuditDetails = Backbone.Model.extend({
		url: '',
		initialize: function(options){
			this.url = options.url;
		}
	});
	return AuditDetails;
});