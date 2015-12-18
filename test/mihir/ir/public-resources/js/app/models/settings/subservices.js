/*global define:false*/
define(['models/baseModel'], function (BaseModel) {
	"use strict";
	
	var SubService = BaseModel.extend({
		url: '/ir/secure/api/settings/getServicesDetails'
		
	});
	return SubService;
});