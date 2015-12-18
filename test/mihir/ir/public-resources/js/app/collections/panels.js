/*global define:false*/
define([ 'collections/BaseCollection', 'models/panel' ], function(BaseCollection,
		Panel) {
	"use strict";
	var Panels = BaseCollection.extend({
		model : Panel,
		initialize: function(options) {
    		    this.genomeId = options.genomeId;
  		},
  		url: function() {
  			 return '/ir/secure/api/assay/targetRegions';
  		}
	});

	return Panels;
});
