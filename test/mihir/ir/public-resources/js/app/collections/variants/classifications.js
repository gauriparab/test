/*global define:false*/
define([ 'collections/BaseCollection', 'models/variants/classification' ], function(BaseCollection,
		Classification) {
	"use strict";
	var Classifications = BaseCollection.extend({
		model : Classification,
		
		urlRoot: '/ir/secure/api/data/getclassificationList',
		
		initialize : function(options) {
			this.id = options.id;
		},
		
		url : function() {
			return this.urlRoot + "?resultId=" + this.id;
		}	
			
	});

	return Classifications;
});
