/*global define:false*/
define([ 'underscore', 'collections/BaseCollection', 'models/moduleParameter' ], function(_, BaseCollection,
		ModuleParameter) {
	"use strict";
	var ModuleParameterCollection = BaseCollection.extend({
		model : ModuleParameter,
		getSections : function() {
			var sections = [];
			var moduleParameters = this.toJSON();
			_.each(moduleParameters, function(ModuleParameter) {
				if(!ModuleParameter.hidden) {
					sections.push(ModuleParameter.section);
				}
			});
			sections = _.uniq(sections, function(ModuleSection) {
				return ModuleSection.name;
			});
			return sections;
		},
		getParametersBySectionThenByGroupMap : function() {

			var moduleParameters = this.toJSON();
			moduleParameters = _.sortBy(moduleParameters, function(ModuleParameter) {
				return parseInt(ModuleParameter.order, 10);
			});
			var paramsBySection = _.groupBy(moduleParameters, function(ModuleParameter) {
				return ModuleParameter.section.name;
			});
			_.each(paramsBySection, function(params, index, list) {
				list[index] = _.groupBy(params, function(ModuleParameter) {
					return ModuleParameter.group;
				});
			});
			return paramsBySection;
		}
	});

	return ModuleParameterCollection;
});