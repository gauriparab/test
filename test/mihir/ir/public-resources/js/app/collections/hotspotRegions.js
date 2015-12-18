/*global define:false*/
define([ 'collections/BaseCollection', 'models/hotspotRegion' ], function(BaseCollection,
		HotSpotRegion) {
	"use strict";
	var HotSpotRegions = BaseCollection.extend({
		model : HotSpotRegion,
		url: '/ir/secure/api/v40/workflows/hotspotRegions'

	});

	return HotSpotRegions;
});