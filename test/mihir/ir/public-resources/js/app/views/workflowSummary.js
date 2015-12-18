/*global define:false*/
define(['jquery', 'backbone', 'hb!templates/workflow-summary.html', 
        'hb!templates/plugin-popover-content.html', 'hb!templates/workflow/workflow-reference-popover-content.html'].concat("bootstrap"), 
    function ($, Backbone, template, pluginPopoverTemplate, referencesPopoverTemplate) {
    "use strict";
    var WorkflowSummaryView = Backbone.View.extend({

        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
        },
        
        render : function () {
            var templateJson = this.model.toJSON();
            this.$el.html(template(templateJson));
            this.$("#selectedPlugins").popover({
                trigger: "hover", 
                placement: "top", 
                content: pluginPopoverTemplate(templateJson),
                html: true
            });
            this.$("#multipleSelectedReferences").popover({
                trigger: "hover", 
                placement: "top", 
                content: referencesPopoverTemplate(templateJson),
                html: true
            });
            return this;
        }
    });

    return WorkflowSummaryView;
});