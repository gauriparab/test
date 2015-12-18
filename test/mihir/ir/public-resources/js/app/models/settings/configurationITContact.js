/*global define:false*/
define(['models/baseModel'], function (BaseModel) {
	"use strict";
	
	var configurationITContact = BaseModel.extend({
		url: '/ir/secure/api/settings/'
		
	});
	return configurationITContact;
});