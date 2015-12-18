/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var urls = {
		'get':'/ir/secure/api/settings/datamanagement/getArchiveSettings',
		'set':'/ir/secure/api/settings/datamanagement/saveArchiveSettings'
	};
	var NetworkSettings = Backbone.Model.extend({
		url: '',
		initialize: function(options){
			this.url = urls[options.type];
		}
	});
	return NetworkSettings;
});