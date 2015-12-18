/*global define:false*/
define([ 'collections/BaseCollection', 'models/panelKit' ], function(BaseCollection,
		PanelKit) {
	"use strict";
	var PanelKits = BaseCollection.extend({
		model : PanelKit,
		url: '/ir/secure/api/assay/kit?type=PanelKit'
	});

	return PanelKits;
});
