/*global define:false*/
define(['jquery', 'underscore','views/ParentView', 'events/eventDispatcher',
        'hb!templates/plugin-collection.html'].concat('bootstrap'),
    function ($, _, ParentView, dispatcher, template) {
    "use strict";
    var PluginsCollectionView = ParentView.extend({
        initialize: function () {
            this.listenTo(this.collection, 'sync', this.render);
            this.model = this.options.model || null;
            this.selected = this.model && this.model.get("plugins") || [];
            this.type = this.options.type;
        },

        events: {
            'click .action': 'togglePlugin'
        },

        render : function() {
            var self = this,
                plugins = this.collection.toJSON();

            this.renderTemplate(plugins);

            _.each(this.selected, function(select) {
                self.$el.find("[data-id='" + select.id + "']").addClass("active");
            });

            return this;
        },

        togglePlugin : function(e) {
            if ($(e.currentTarget).hasClass('action-disabled')) {
                return;
            }
            var pluginId = $(e.currentTarget).attr("data-id");
            var plugin = this.collection.get(pluginId);

            if ( $(e.currentTarget).hasClass("active")) {
                $(e.currentTarget).removeClass("active");
                this.selected = _.reject(this.selected, function(selectedPlugin){ return selectedPlugin.id === plugin.id; });
            } else {
                $(e.currentTarget).addClass("active");
                this.selected = this.selected.concat([plugin]);
            }

            this.model.set("plugins", this.selected);
        },

        renderTemplate : function(plugins) {
            var inAnalysisPlugins = _.where(plugins, {execType: 'IN_ANALYSIS'});
            var postAnalysisPlugins = _.where(plugins, {execType: 'POST_ANALYSIS'});
            this.$el.html(template({
                inAnalysisPlugins: inAnalysisPlugins,
                postAnalysisPlugins: postAnalysisPlugins
            }));
        }

    });

    return PluginsCollectionView;
});