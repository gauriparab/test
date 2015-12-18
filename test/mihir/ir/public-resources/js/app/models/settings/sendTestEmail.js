/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var SendTestEmail = Backbone.Model.extend({
		url: '/ir/secure/api/settings/sendTestMail',
	});
	return SendTestEmail;
});