/*global define:false*/
define([ 'backbone', 'models/data/signOffDetails' ], function(Backbone, SignOffModel) {
	'use strict';
	
	var SignOff = Backbone.Collection.extend({
		model: SignOffModel,
		
		urlRoot : '/ir/secure/api/installTemplate/getSignOffDetails',

		initialize : function(options) {
			this.id = options.id;
		},
		
		url : function() {
			return this.urlRoot + "?resultId=" + this.id;
		}
	});
	return SignOff;
});