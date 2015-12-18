/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var ReasonModel = Backbone.Model.extend({
		url: '/ir/secure/api/auditableObject/getAuditableObjectDetails?objectName=',
		initialize: function(options){
			this.url += options.obj; 
		}
	});
	return ReasonModel;
});