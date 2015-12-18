/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'hb!templates/workflow-ampliseq-fixed-panels.html'], function($, _, Backbone, template) {
	"use strict";
	var FixedDesignPanelsView = Backbone.View.extend({
		initialize: function() {
			this.listenTo(this.collection, 'sync', this.render);
			this.model = this.options.model || null;
		},

		render: function() {
			this.$el.html(template({
				fixedDesignPanels: this.collection.toJSON()
			}));

			return this;
		},

        getSelectedAmpliseqId: function () {
            var fixedPanelsList = this.$el.find("#fixedPanelsList");
            return fixedPanelsList.val();
        }
	});

	return FixedDesignPanelsView;
});