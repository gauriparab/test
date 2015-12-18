/*global define:false*/
define(['backbone', 'models/chevron'], function (Backbone, Chevron) {
	"use strict";
	var Chevrons = Backbone.Collection.extend({
		model: Chevron
	});
	return Chevrons;
});