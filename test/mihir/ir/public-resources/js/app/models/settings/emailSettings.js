/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var urls = {
		'get':'/ir/secure/api/settings/getEmailSettings',
		'set':'/ir/secure/api/settings/saveEmailSettings'
	};
	var EmailSettings = Backbone.Model.extend({
		url: '',
		initialize: function(options){
			this.url = urls[options.requestType]
		}
	});
	return EmailSettings;
});