/*global define:false*/
define([ 'collections/BaseCollection', 'models/controlKit' ], function(BaseCollection,
		ControlKit) {
	"use strict";
	var ControlKits = BaseCollection.extend({
		model : ControlKit,
		url: '/ir/secure/api/assay/kit?type=ControlKit'
	});

	return ControlKits;
});
