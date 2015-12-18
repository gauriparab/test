/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var DataUsage = Backbone.Model.extend({
		url: '/ir/secure/api/settings/datamanagement/getDiskSpaceUsage',
	});
	return DataUsage;
});