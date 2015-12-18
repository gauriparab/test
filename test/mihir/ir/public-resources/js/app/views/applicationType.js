/*global define:false*/
define([ 'jquery', 'backbone', 'events/eventDispatcher', 'hb!templates/applicationType.html' ], function($, Backbone,
		dispatcher, template) {
	"use strict";
	var ApplicationTypeView = Backbone.View.extend({
		initialize : function() {
			this.selected = this.options.selected;
			this.ver = null;
		},

		events : {
			"click div._switch" : "toggle",
			'change select': 'toggle'
		},

		toggle : function() {
//			$(".application").removeClass('active');
//			this.$el.find(".application").addClass('active');
//			dispatcher.trigger('change:applicationType', this.model);
			
			$(".application").removeClass('active');
			this.$el.find(".application").addClass('active');
			var ver = this.ver || this.$el.find('select').val();
			this.model.set('version',ver);
			dispatcher.trigger('change:applicationType', this.model);
		},
		
		accordionEvent: function(){
			var that = this;
		},
		
		render : function() {
			this.$el.html(template(this.model.toJSON()));
			if (this.selected && this.model.get("identifier") === this.selected) {
				this.$el.find(".application").addClass('active');
			}
			return this;
		}
	});

	return ApplicationTypeView;
});