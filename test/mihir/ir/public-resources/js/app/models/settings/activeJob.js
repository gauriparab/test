/*global define:false*/
define(['models/baseModel'], function (BaseModel) {
	"use strict";
	
	var ActiveJob = BaseModel.extend({
		url: '/ir/secure/api/settings/getActiveJobDetails'
		
	});
	return ActiveJob;
});