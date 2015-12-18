/* global define:false*/
define([
        'views/ParentView',
        'models/eulaLicenseModel',
        'hb!templates/settings/about-eula-view.html'
		],

		function(
				ParentView,
				EulaModel,
				template) {

			'use strict';

			var AboutView = ParentView.extend({
				_template : template,

				initialize : function(options) {
					var that = this;
					this.license = {};
					this.licenseModel = new EulaModel();
					this.licenseModel.fetch({
						success:function(){
							that.license = that.licenseModel.toJSON();
							that.render();
						}
					});
				},
				
				events: {},

				delegateEvents : function() {
					Backbone.View.prototype.delegateEvents.apply(this, arguments);
				},

				undelegateEvents : function() {
					Backbone.View.prototype.undelegateEvents.apply(this, arguments);
				},

				render : function() {
					this.$el.html(this._template({
						eula : this.license.eula
					}));
				}
			});
			return AboutView;
		});