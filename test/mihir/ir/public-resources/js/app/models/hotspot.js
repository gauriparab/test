/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var Hotspot = Backbone.Model.extend({
		url:'/ir/secure/api/settings/createTargetRegionFile'
	});

	return Hotspot;
});