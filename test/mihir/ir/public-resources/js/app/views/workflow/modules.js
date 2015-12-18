/*global define:false*/
define([ 'jquery', 'underscore', 'backbone', 'hb!templates/workflow/modules.html' ], 
    function($, _, Backbone, template) {
	"use strict";
	var ModulesView = Backbone.View.extend({
		initialize : function() {
			this.listenTo(this.collection, 'sync', this.render);
			this.model = this.options.model || null;
		},

		events : {
			'click ul.parameters-sidebar li a' : 'selectionChanged'
		},

		render : function() {
			this.$el.html(template({
				modules : this.collection.toJSON()
			}));
			if (this.selected) {
				this.$el.find("[data-cid='" + this.selected.cid + "']").parent().addClass("active");
			}

			return this;
		},
		
		selectionChanged : function(e) {
			e.preventDefault();
			var moduleId = $(e.currentTarget).data('cid');
			this.selected = this.collection.get(moduleId);

			$(e.currentTarget).parent().siblings().removeClass("active");
			$(e.currentTarget).parent().addClass("active");

			this.trigger('moduleSelected', this.selected);
		}
	});

	return ModulesView;
});