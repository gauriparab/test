/*global define:false*/
define([ 'backbone', 'models/data/histoGram' ], function(Backbone, HistoGramModel) {
	'use strict';
	
	var HistoGram = Backbone.Collection.extend({
		model: HistoGramModel,
		
		urlRoot : '/ir/secure/api/data/histogramPath',

		initialize : function(options) {
			this.id = options.id;
		},
		
		url : function() {
			return this.urlRoot + "?resultId=" + this.id;
		}
	});
	return HistoGram;
});