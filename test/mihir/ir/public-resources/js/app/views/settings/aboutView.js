/* global define:false*/
define([
        'views/ParentView',
        'hb!templates/settings/about-view.html'
        ],

		function(
				ParentView,
				template) {

			'use strict';

			var AboutView = ParentView.extend({

				_template : template,

				initialize : function(options) {
				},
				
				events: {},

				delegateEvents : function() {
					Backbone.View.prototype.delegateEvents.apply(this, arguments);
				},

				undelegateEvents : function() {
					Backbone.View.prototype.undelegateEvents.apply(this, arguments);
				},

				render : function() {
					this.$el.html(this._template({}));
				}
			});
			return AboutView;
		});
