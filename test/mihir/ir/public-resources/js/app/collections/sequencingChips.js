/*global define:false*/
define([ 'collections/BaseCollection', 'models/sequencingChip' ], function(BaseCollection,
		SequencingChip) {
	"use strict";
	var SequencingChips = BaseCollection.extend({
		model : SequencingChip,
		url: '/ir/secure/api/assay/kit?type=ChipKit'
	});

	return SequencingChips;
});
