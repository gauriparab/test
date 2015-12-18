/*global define:false*/
define([ 'collections/BaseCollection', 'models/assay/classificationSetModel' ], function(BaseCollection, ClassificationSet) {

	"use strict";

	var ClassificationSet = BaseCollection.extend({
		model : ClassificationSet,
		url: '/ir/secure/api/assay/classificationSets'
	});

	return ClassificationSet;
});