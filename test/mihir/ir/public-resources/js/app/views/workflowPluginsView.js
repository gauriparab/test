/*global define:false*/
define(['views/ParentView', 'views/pluginsCollectionView', 'events/eventDispatcher', 'collections/workflowPlugins', 
        'hb!templates/workflow-plugins.html'], 
        function(ParentView, PluginsCollectionView, dispatcher, WorkflowPluginsCollection, 
                 template) {
    "use strict";
    var WorkflowView = ParentView.extend({
        initialize: function() {
            this.plugins = new WorkflowPluginsCollection();
            this.pluginsCollectionView = new PluginsCollectionView({
                collection: this.plugins,
                model: this.model
            });
        },

        render: function() {

            this.plugins.getAllowed(this.model);

            this.$el.html(template);
            this.renderSubView(this.pluginsCollectionView, "#plugins");
            return this;
        }

    });

    return WorkflowView;
});