/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var ImportReferences = Backbone.Model.extend({
		url: '/ir/secure/api/settings/genomicReferences'
	});
	return ImportReferences;
});