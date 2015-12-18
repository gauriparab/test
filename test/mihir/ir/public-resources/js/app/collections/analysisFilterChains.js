/*global define:false*/
define([
    'collections/filterChains'
], function(
    FilterChains
) {
    'use strict';

    var AnalysisFilterChains = FilterChains.extend({
        url: '/ir/secure/api/v40/filterChains',

        parse: function(response) {
            return response.content;
        }
    });

    return AnalysisFilterChains;
});
