/*global define:false*/
define(['models/baseModel'], function (BaseModel) {
	"use strict";
	
	var CrawlerService = BaseModel.extend({
		url: '/ir/secure/api/settings/getCrawlerDetails'
		
	});
	return CrawlerService;
});