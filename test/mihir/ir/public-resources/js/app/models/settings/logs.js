/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var urls = {
		'get':'/ir/secure/api/settings/logs/getManageLogFile',
		'set':'/ir/secure/api/settings/logs/saveManagelogFileInfo',
	};
	var LabInformation = Backbone.Model.extend({
		url: '',
		initialize: function(options){
			this.url = urls[options.type];
		}
	});
	return LabInformation;
});