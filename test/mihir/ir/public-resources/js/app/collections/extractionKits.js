/*global define:false*/
define([ 'collections/BaseCollection', 'models/extractionKit' ], function(BaseCollection,
		ExtractionKit) {
	"use strict";
	var ExtractionKits = BaseCollection.extend({
		model : ExtractionKit,
		url: '/ir/secure/api/assay/kit?type=ExtractionKit'
	});

	return ExtractionKits;
});
