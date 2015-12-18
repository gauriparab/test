/*global define:false*/
define(['models/baseModel'], function (BaseModel) {
	"use strict";
	
	var RsmService = BaseModel.extend({
		url: '/ir/secure/api/settings/getRSMServiceDetails'
		
	});
	return RsmService;
});