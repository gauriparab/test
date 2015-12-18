/*global define:false*/
define([ 'collections/BaseCollection', 'models/validFusionPanel' ], function(BaseCollection,
		ValidFusionPanel) {
	"use strict";
	var ValidFusionPanels = BaseCollection.extend({
		model : ValidFusionPanel,
  		url: function() {
  			 return '/ir/secure/api/settings/validFusionReferences';
  		}
	});

	return ValidFusionPanels;
});
