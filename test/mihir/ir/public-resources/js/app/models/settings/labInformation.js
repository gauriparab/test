/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var urls = {
		'get':'/ir/secure/api/settings/labinformation/getCustomerSupportContacts',
		'set':'/ir/secure/api/settings/labinformation/saveCustomerSupportContact'
	};
	var LabInformation = Backbone.Model.extend({
		url: '',
		initialize: function(options){
			this.url = urls[options.type]
		}
	});
	return LabInformation;
});