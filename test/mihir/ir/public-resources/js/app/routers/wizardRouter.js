/*global define:false*/
define(["underscore", "jquery", "handlebars", "backbone", "events/eventDispatcher"], function(_, $, Handlebars, Backbone, dispatcher) {
	"use strict";

	var WorkflowRouter = Backbone.Router.extend({
		routes: {
			"" : "index",
			"*tab": "action"
		},

		index: function() {
			dispatcher.trigger('navigate:wizard', "APPLICATION");
		},

		action: function(tab) {
			dispatcher.trigger('navigate:wizard', tab.toUpperCase());
		}

	});

	return WorkflowRouter;
});