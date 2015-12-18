/*global define:false*/
define([ 'collections/BaseCollection', 'models/sequencingKit' ], function(BaseCollection,
		SequencingKit) {
	"use strict";
	var SequencingKits = BaseCollection.extend({
		model : SequencingKit,
		url: '/ir/secure/api/assay/kit?type=SequencingKit'
	});

	return SequencingKits;
});
