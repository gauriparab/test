/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var SpecimenDetails = Backbone.Model.extend({
		url: '/ir/secure/api/specimen/specimenDetails?specimenId=',
		initialize: function(options){
			this.url+=options.id;
		}
	});
	return SpecimenDetails;
});