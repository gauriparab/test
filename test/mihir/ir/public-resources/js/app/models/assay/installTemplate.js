/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var InstallTemplate = Backbone.Model.extend({
		url : "/ir/secure/api/installTemplate/viewDetails?assayId=",
		
		initialize : function(options) {
			this.url += options.templateId;
		}
	});

	return InstallTemplate;
});
