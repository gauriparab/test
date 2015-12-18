/*global define:false*/
define([ 'collections/plugins'], function(BasePluginsCollection) {
    "use strict";
    var AnalysisPlugins = BasePluginsCollection.extend({
        url: '/ir/secure/api/v40/analysis/allowed/plugins'
    });

    return AnalysisPlugins;
});