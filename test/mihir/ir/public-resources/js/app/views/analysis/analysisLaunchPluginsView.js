/*global define:false*/
define(['views/templateView', 'views/pluginsCollectionView', 'collections/analysisPlugins',
        'hb!templates/analysis/analysis-launch-plugins.html'],
    function(TemplateView, AnalysisLaunchPluginsCollectionView, AnalysisPluginsCollection,
            template) {
        'use strict';

        var PluginsView = TemplateView.extend({

            template: template,
            
            initialize: function() {
                this.plugins = new AnalysisPluginsCollection();
                this.pluginsCollectionView = new AnalysisLaunchPluginsCollectionView({
                    collection: this.plugins,
                    model: this.model
                });
            },

            render: function() {
                this.pluginsCollectionView.selected = this.model.get('plugins');
                this.plugins.getAllowed(this.model);
                this.$el.html(template);
                this.renderSubView(this.pluginsCollectionView, "#plugins");
            }
        });

        return PluginsView;

    }
);