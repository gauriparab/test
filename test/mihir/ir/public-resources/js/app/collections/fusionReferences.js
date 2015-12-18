/*global define:false*/
define([ 'collections/BaseCollection', 'models/fusionReference' ], function(BaseCollection,
		FusionReference) {
	"use strict";
	var FusionReferences = BaseCollection.extend({
		model : FusionReference,
  		url: function() {
  			 return '/ir/secure/api/assay/fusionRef';
  		}
	});

	return FusionReferences;
});
