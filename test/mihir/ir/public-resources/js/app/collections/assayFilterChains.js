/*global define:false*/
define([ 'collections/BaseCollection', 'collections/filterChains' ], function(BaseCollection,
        FilterChains) {
    "use strict";
    var AssayFilterChains = FilterChains.extend({
        url: '/ir/secure/api/assay/filterChains'
    });

    return AssayFilterChains;
});