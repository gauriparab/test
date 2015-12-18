/*global define:false*/
define([ 'jquery', 'underscore', 'backbone', 'models/module', 'collections/moduleParameters', 
    'hb!templates/workflow/module-parameters.html', 'views/workflow/moduleParameter' ].concat([ 'bootstrap' ]), 
    function($, _, Backbone, Module, ModuleParameterCollection, template, ModuleParameterView) {
	"use strict";
	var ModuleParametersView = Backbone.View.extend({
		el : '#module-tab-content',

		initialize : function() {
			this.model = this.options.model || new Module();
			this.version = this.options.version;
			this.collection = this.options.collection || this.model.get('parameters');
			this.moduleParameterViews = [];
		},

		events : {},

		_preRender : function() {
			// Remove existing ModuleParameterView(s)
			_.each(this.moduleParameterViews, function(view) {
                view.undelegateEvents();
				view.remove();
			});
			this.moduleParameterViews = [];
		},
		
		_postRender : function() {
			// Construct & render all the ModuleParameterViews
            this.collection.each(function(model) {
				if (!model.attributes.hidden) {
					var view = this._buildModuleParameterViewAndRenderFromModel(model);
					this.moduleParameterViews.push(view);
				}
			}, this);
		},
		
		_buildModuleParameterViewAndRenderFromModel : function(model) {
			var view = new ModuleParameterView({
				model : model
			});
			var elemId = view.model.toJSON()._key;
			view.setElement(this.$('#' + elemId));
			view.render();
			return view;
		},

		render : function() {
			this._preRender();

			this.$el.html(template({
				version : this.version,
				parametersBySectionByGroup : this.collection.getParametersBySectionThenByGroupMap()
			}));

			this._postRender();
			return this;
		}
	});

	return ModuleParametersView;
});
