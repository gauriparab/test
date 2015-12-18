/*global define:false*/
define([ 'collections/BaseCollection', 'collections/filterChains' ], function(BaseCollection,
        FilterChains) {
    "use strict";
    var WorkflowFilterChains = FilterChains.extend({
        url: '/ir/secure/api/v40/workflows/filterChains'
    });

    return WorkflowFilterChains;
});
