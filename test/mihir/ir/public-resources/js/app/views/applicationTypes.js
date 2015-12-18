/*global define:false*/
define([
        'jquery',
        'underscore',
        'backbone',
        'events/eventDispatcher',
        'hb!templates/applicationType.html'],
function (
		$,
		_,
		Backbone,
		dispatcher,
		template) {
	"use strict";
	var ApplicationTypeCollectionView = Backbone.View.extend({
		initialize : function() {
			this.listenTo(this.collection, 'sync', this.render);
			this.model = this.options.model || null;
		},

		events:{
			'click ._toggler':'toggle',
			'change select': 'versionChanged'
		},

		toggle : function(e,f) {
			var target = $(e.currentTarget).parent();
			var index = target.data('sel');
			var model = this.collection.models[index];
			var data = model.toJSON();
			$(".application").removeClass('active');
			target.addClass('active')
			var v = target.find('select').val();
			var nm = target.find('select option:selected').text();
			var ver = {
					id:v,
					value:nm
			};
			this.model.set('version',ver);
			dispatcher.trigger('change:applicationType', model);
		},

		versionChanged: function(ev,model){
			var target = $(ev.target);
			var v = target.val();
			var n = target.find('option:selected').text();
			var ver = {
				id:v,
				value:n
			};
			this.model.set('version',ver);
		},

		render : function() {
			var that = this;
			var applicationTypeViews = [];

			this.JSONCollection = this.collection.toJSON();

			this.selected = this.model && this.model.get("applicationType") || null;
			$(this.el).empty();
			this.$el.html(template({
				applications:this.collection.toJSON()
			}));
      $("[data-toggle='tooltip']").tooltip();
			return this;
		}
	});

	return ApplicationTypeCollectionView;
});
