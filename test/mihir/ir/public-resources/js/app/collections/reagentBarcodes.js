/*global define:false*/
define([ 'collections/BaseCollection', 'models/reagentBarcode' ], function(BaseCollection,
		ReagentBarcode) {
	"use strict";
	var ReagentBarcodes = BaseCollection.extend({
		model : ReagentBarcode,
		url: '/ir/secure/api/assay/kit?type=BarcodeKit'
	});

	return ReagentBarcodes;
});
