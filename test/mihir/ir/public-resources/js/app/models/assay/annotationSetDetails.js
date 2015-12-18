/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var AnnotationSetsDetails = Backbone.Model.extend({
		url: '/ir/secure/api/annotationSourceSet/annotationSetDetails?id=',
		initialize: function(options){
			this.url+=options.id;
		}
	});
	return AnnotationSetsDetails;
});