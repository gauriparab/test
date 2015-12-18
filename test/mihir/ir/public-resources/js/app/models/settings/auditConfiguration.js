/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var urls = {
		all:'/ir/secure/api/auditableObject/getAuditableObjectList',
		nonSilent:'/ir/secure/api/auditableObject/getNonSilentAuditableObjectList'
	}
	var AuditConfiguration = Backbone.Model.extend({
		url: urls.all,
		initialize: function(options){
			var _opt = options || {};
			if(_opt.isNonSilent){
				this.url = urls.nonSilent
			}
		}
	});
	return AuditConfiguration;
});