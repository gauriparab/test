/*global define:false*/
define([ 'jquery', 'underscore', 'views/ParentView', 'views/workflow/moduleParameters', 'collections/moduleParameters', 
        'models/module', 'hb!templates/workflow/module.html' ].concat([ 'bootstrap' ]), 
        function($, _, ParentView, ModulesParametersView, ModuleParametersCollection, Module, template) {
	"use strict";
	var ModuleView = ParentView.extend({
		initialize : function() {
			this.model = this.options.model || new Module();
			this.version = this.options;
			this.moduleParametersView = new ModulesParametersView({
				model : this.model,
				collection : new ModuleParametersCollection(),
				version : this.version
			});
		},

		events : {},

		render : function() {
			var _data = {
				sections : this.model.get('parameters').getSections()
			};
			this.$el.html(template(_data));
			this.moduleParametersView.collection = this.model.get('parameters');
			this.renderSubView(this.moduleParametersView, '#module-tab-content');
			this.$('[data-toggle="tab"]:first').tab('show');
			return this;
		}
	});

	return ModuleView;
});