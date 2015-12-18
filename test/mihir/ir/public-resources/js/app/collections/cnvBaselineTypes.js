/*global define:false*/
define([ 'collections/BaseCollection', 'models/cnvBaselineType' ], 
    function(BaseCollection, CnvBaselineType) {
	"use strict";
	var CnvBaselineCollection = BaseCollection.extend({
        url: '/ir/secure/api/v40/cnvbaseline/allowed/types',
		model : CnvBaselineType
	});

	return CnvBaselineCollection;
});