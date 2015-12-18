/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var InstrumentsList = Backbone.Model.extend({
		url: '/ir/secure/api/settings/configure/listInstruments',
	});
	return InstrumentsList;
});