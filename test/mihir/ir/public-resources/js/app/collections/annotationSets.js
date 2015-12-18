/*global define:false*/
define([ 'collections/BaseCollection', 'models/annotationSet' ], function(BaseCollection, AnnotationSet) {

	"use strict";

	var AnnotationSets = BaseCollection.extend({
		model : AnnotationSet,
		url: '/ir/secure/api/assay/annotationSets'
	});

	return AnnotationSets;
});