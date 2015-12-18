/*global define:false*/
define([ 'backbone', 'models/data/summary' ], function(Backbone, SummaryModel) {
	'use strict';
	
	var Summary = Backbone.Collection.extend({
		model: SummaryModel,
		
		urlRoot : '/ir/secure/api/data/summary/',

		initialize : function(options) {
			this.id = options.id;
			this.type = options.type;
		},
		
		url : function() {
			return this.urlRoot + this.type + "?resultId=" + this.id;
		}
	});
	return Summary;
});
