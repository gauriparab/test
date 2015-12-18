/*global define:false*/
define([ 'backbone', 'models/data/reviewVerificationRunModel' ], function(Backbone, Qc) {
	'use strict';
	
	var Qcs = Backbone.Collection.extend({
		model: Qc,
		
		url : '/ir/secure/api/installTemplate/getRunTemplateQc?resultId=',

		initialize : function(options) {
			this.url += options.resultId;
		}
	});
	return Qcs;
});
