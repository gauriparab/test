/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var UserList = Backbone.Model.extend({
		url: '/ir/secure/api/user/getAllUsersForAudit',
	});
	return UserList;
});