/*global define:false*/
define([ 'backbone', 'models/data/Qc' ], function(Backbone, Qc) {
	'use strict';
	
	var Qcs = Backbone.Collection.extend({
		model: Qc,
		
		urlRoot : '/ir/secure/api/data/qcReport/Metrics?resultId=',

		initialize : function(options) {
			this.id = options.id;
			this.type = options.type;
		},
		
		url : function() {
			return this.urlRoot + this.id + "&qcType="+this.type;
		}
	});
	return Qcs;
});
