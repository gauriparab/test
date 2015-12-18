/*global define:false*/
define(['jquery', 'backbone', 'hb!templates/annotation-set-selected-sources-row.html'],

function($, Backbone, template) {

	"use strict";

	var RowView = Backbone.View.extend({

		tagName: "tr",
		className: "workflow-setting",


		initialize: function() {
			this.listenTo(this.model, 'fileUploadProgress', this.progress);
			this.listenTo(this.model, 'fileUploadStart', this.start);
			this.listenTo(this.model, 'fileUploadComplete', this.complete);
			this.listenTo(this.model, 'fileUploadError', this.error);
			this.listenTo(this.model, 'fileUploadSuccess', this.success);
		},

		render: function() {
			var json = this.model.toJSON();
			json.cid = this.model.cid;
			this.$el.html(template(json));
			return this;
		},

		start: function() {
			this.$('.progress').show();
		},

		progress: function(data) {
			this.$('.progress .bar').css("width", data + '%');
			if (data === 100) {
				this.$el.find('.progress').removeClass('active progress-striped');
			}
		},

		success: function() {
			this.$('.progress').addClass('progress-success');
		},

		complete: function() {
			this.$('.progress').removeClass('active progress-striped');
		},

		error: function() {
			this.progress(100);
			this.$('.progress').addClass('progress-danger');
		}

	});

	return RowView;
});