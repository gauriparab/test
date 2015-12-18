/*global define:false*/
define([ 'backbone', 'models/data/reanalyzeAssay' ], function(Backbone,
		ReanalyzeAssay) {
	'use strict';

	var ReanalyzeAssays = Backbone.Collection.extend({
		model : ReanalyzeAssay,

		urlRoot : '/ir/secure/api/data/reanalysisAssays?resultId=',

		initialize : function(options) {
			this.id = options.id;
			this.resultId = options.resultId;
		},

		url : function() {
			return this.urlRoot + this.resultId;
		}
	});
	return ReanalyzeAssays;
});
