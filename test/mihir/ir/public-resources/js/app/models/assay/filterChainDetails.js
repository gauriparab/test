/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var FilterChainDetails = Backbone.Model.extend({
		url: '/ir/secure/api/filterChain/filterChainDetails?id=',
		initialize: function(options){
			this.url+=options.id;
		}
	});
	return FilterChainDetails;
});