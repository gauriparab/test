/*global define:false*/
define([ 'collections/BaseCollection', 'models/hotspot' ], function(BaseCollection,
		Hotspot) {
	"use strict";
	var Hotspots = BaseCollection.extend({
		model : Hotspot,
		url: '/ir/secure/api/assay/hotspotRegions'
	});

	return Hotspots;
});