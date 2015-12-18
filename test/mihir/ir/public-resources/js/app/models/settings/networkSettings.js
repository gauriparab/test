/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var urls = {
		'getSettings':'/ir/secure/api/settings/getNetworkSettings',
		'getStatus':'/ir/secure/api/settings/getNetworkStatus',
		'save':'/ir/secure/api/settings/saveNetworkSettings'
	};
	var NetworkSettings = Backbone.Model.extend({
		url: '',
		initialize: function(options){
			this.url = urls[options.requestType]
		}
	});
	return NetworkSettings;
});