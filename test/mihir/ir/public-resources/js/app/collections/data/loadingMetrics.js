/*global define:false*/
define([ 'backbone', 'models/data/loadingMetric' ], function(Backbone, LoadingMetric) {
	'use strict';
	
	var LoadingMetrics = Backbone.Collection.extend({
		model: LoadingMetric,
		
		urlRoot : '/ir/secure/api/data/loadingMetrics/loadingMetrics?resultId=',

		initialize : function(options) {
			this.id = options.id;
		},
		
		url : function() {
			return this.urlRoot + this.id;
		}
	});
	return LoadingMetrics;
});
