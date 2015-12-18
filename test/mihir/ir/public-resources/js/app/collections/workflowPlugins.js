/*global define:false*/
define([ 'collections/plugins'], function(BasePluginsCollection) {
    "use strict";
    var WorkflowPlugins = BasePluginsCollection.extend({
        url: '/ir/secure/api/v40/workflows/plugins'
    });

    return WorkflowPlugins;
});