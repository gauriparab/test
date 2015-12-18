/*global define:false*/
define([ 'underscore', 'models/baseModel' ], function(_, BaseModel) {

	'use strict';

	var QcReportDetail = BaseModel.extend({

		urlRoot : '/ir/secure/api/data/specimenDetail?specimenId=',

		initialize : function(options) {
			this.id = options.id;
		},
		
		url : function() {
			return this.urlRoot + this.id;
		}
	});

	return QcReportDetail;

});
