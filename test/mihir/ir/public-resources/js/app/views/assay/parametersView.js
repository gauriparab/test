define(['backbone',
        'underscore',
        'hb!templates/assay/parameters-view.html'],
	function(Backbone,
			_,
			template){
	'use strict';
	
	var ParametersView = Backbone.View.extend({
		render: function(){
			var main = _.filter(this.options.parameters, function(parameter){ return parameter.section.name === "main"});
			var advanced = _.filter(this.options.parameters, function(parameter){ return parameter.section.name === "advanced"});
			
			this.$el.html(template({
				main: main,
				advanced: advanced
			}));
		}
	});
	
	return ParametersView;
});