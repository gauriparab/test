/*global define:false*/
define([ 'underscore', 'collections/BaseCollection', 'models/targetRegion' ], 
    function(_, BaseCollection, TargetRegion) {
	"use strict";
	var TargetRegions = BaseCollection.extend({
		model : TargetRegion,
        url : function() {
            return this.baseUrl + '/targetRegions';
        },

        initialize: function(options) {
            this.baseUrl = _.result(options, 'baseUrl') || '/ir/secure/api/v40/workflows';
        }
	});

	return TargetRegions;
});