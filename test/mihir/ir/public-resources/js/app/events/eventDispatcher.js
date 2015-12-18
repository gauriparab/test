/*global define:false*/
define(['underscore', 'backbone'], function (_, Backbone) {
	"use strict";
	var dispatcher = _.extend({}, Backbone.Events);
	return dispatcher;
});