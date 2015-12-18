/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var SoftwareVersions = Backbone.Model.extend({
		url: '/ir/secure/api/settings/getVersionDetails',
	});
	return SoftwareVersions;
});