/*global define:false*/
define([ 'collections/BaseCollection', 'models/filterChain' ], function(BaseCollection, FilterChain) {

    "use strict";

    var FilterChains = BaseCollection.extend({
        model: FilterChain,
        
        findFilterChain: function(id) {
            return id ? this.get(id) : null;
        }
    });

    return FilterChains;
});