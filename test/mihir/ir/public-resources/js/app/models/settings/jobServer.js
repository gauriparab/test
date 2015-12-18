/*global define:false*/
define(['models/baseModel'], function (BaseModel) {
	"use strict";
	
	var JobServer = BaseModel.extend({
		url: '/ir/secure/api/settings/getServerDetails'
		
	});
	return JobServer;
});