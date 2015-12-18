/* global define:false*/
define([
        'views/ParentView',
        'views/settings/controlFragmentsGrid',
        'hb!templates/settings/control-fragments.html'],

		function(
				ParentView,
				ControlFragmentsGrid,
				template) {

			'use strict';

			var GeneListView = Backbone.View.extend({

				_template : template,
				_gridEl : '#controlFragmentsGrid',

				initialize : function(options) {
					options = options || {};
					this.gridView = new ControlFragmentsGrid();
				},
				
				events: {},

				delegateEvents : function() {
					Backbone.View.prototype.delegateEvents.apply(this,arguments);
				},

				undelegateEvents : function() {
					Backbone.View.prototype.undelegateEvents.apply(this,arguments);
				},

				render : function() {
					this.$el.html(this._template({}));
					this.gridView.setElement(this.$(this._gridEl)).render();
				}
			});

			return GeneListView;
		});
