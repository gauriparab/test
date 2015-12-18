/*global define:false*/
define(['models/baseModel'], function (BaseModel) {
	"use strict";
	
	var configurationLabContact = BaseModel.extend({
		url: '/ir/secure/api/settings/'
		
	});
	return configurationLabContact;
});