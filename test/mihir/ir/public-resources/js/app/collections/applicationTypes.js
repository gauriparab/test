/*global define:false*/
define([ 'backbone', 'models/applicationType' ], function(Backbone,
		ApplicationType) {
	"use strict";
	var ApplicationTypes = Backbone.Collection.extend({
		model : ApplicationType
	});

	return ApplicationTypes;
});