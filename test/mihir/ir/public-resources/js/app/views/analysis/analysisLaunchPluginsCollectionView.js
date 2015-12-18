/*global define:false*/
define(['jquery', 'underscore','views/pluginsCollectionView', 'events/eventDispatcher', 'hb!templates/analysis/analysis-launch-plugin-collection.html'].concat('bootstrap'),
    function ($, _, PluginsCollectionView, dispatcher, template) {
    "use strict";
    var AnalysisLaunchPluginsCollectionView = PluginsCollectionView.extend({
        
        renderTemplate : function(plugins) {
            var preAnalysisPlugins = plugins.filter(function(pl) {
                return pl.execType !== 'POST_ANALYSIS';
            });
            var postAnalysisPlugins = plugins.filter(function(pl) {
                return pl.execType && pl.execType === 'POST_ANALYSIS';
            });
            this.$el.html(template({
                preAnalysisPlugins: preAnalysisPlugins,
                postAnalysisPlugins: postAnalysisPlugins
            }));
        }
    });
    
    return AnalysisLaunchPluginsCollectionView;
});