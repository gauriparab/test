/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var NetworkSettings = Backbone.Model.extend({
		url: '/ir/secure/api/auditableObject/addAuditableObject',
	});
	return NetworkSettings;
});