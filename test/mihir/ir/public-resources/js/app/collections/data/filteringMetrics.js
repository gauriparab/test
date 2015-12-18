/*global define:false*/
define([ 'backbone', 'models/data/filteringMetric' ], function(Backbone, FilteringMetric) {
	'use strict';
	
	var FilteringMetrics = Backbone.Collection.extend({
		model: FilteringMetric,
		
		urlRoot : '/ir/secure/api/data/loadingMatrics/filteringMetrics?resultId=',

		initialize : function(options) {
			this.id = options.id;
		},
		
		url : function() {
			return this.urlRoot + this.id;
		}
	});
	return FilteringMetrics;
});
