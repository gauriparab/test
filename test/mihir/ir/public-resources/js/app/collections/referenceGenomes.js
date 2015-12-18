/*global define:false*/
define([ 'collections/BaseCollection', 'models/referenceGenome' ], function(BaseCollection,
		ReferenceGenome) {
	"use strict";
	var ReferenceGenomes = BaseCollection.extend({
		model : ReferenceGenome,
		url: '/ir/secure/api/assay/getRefGenomes'
	});

	return ReferenceGenomes;
});
