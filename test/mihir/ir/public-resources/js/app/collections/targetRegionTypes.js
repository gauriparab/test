/*global define:false*/
define([ 'collections/BaseCollection', 'models/targetRegionType' ], function(BaseCollection,
        TargetRegionType) {
    "use strict";
    var TargetRegionTypes = BaseCollection.extend({
        model : TargetRegionType,
        url: '/ir/secure/api/v40/workflows/targetRegionTypes'

    });

    return TargetRegionTypes;
});