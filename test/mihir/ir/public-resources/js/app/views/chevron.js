/*global define:false*/
define(['jquery', 'backbone', 'events/eventDispatcher', 'hb!templates/chevron.html'], function ($, Backbone, dispatcher, template) {
	"use strict";
	var ChevronView = Backbone.View.extend({
		tagName : "li",

		render: function(){
			this.$el.html( template(this.model.toJSON()) );
			return this;
		}
	});
	return ChevronView;
});