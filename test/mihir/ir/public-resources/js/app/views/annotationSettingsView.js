/*global define:false*/
define(['backbone', 'hb!templates/assay-annotation-settings.html'], function (Backbone, template) {
	"use strict";
	var WorkflowAnnotationSettingsView = Backbone.View.extend({

		initialize: function () {
			this.listenTo(this.model, 'change:annotationSet', this.render);
		},

		render : function () {
            var annotationSet = this.model.get("annotationSet"); 
            if (annotationSet && annotationSet.get("sources")) {
                this.$el.html(template({sources : annotationSet.get("sources").toJSON()}));
            }
			return this;
		}
	});

	return WorkflowAnnotationSettingsView;
});