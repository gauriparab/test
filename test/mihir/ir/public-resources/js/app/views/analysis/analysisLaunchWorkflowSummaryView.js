/*global define:false */
define(['jquery', 'backbone', 'hb!templates/analysis/analysis-launch-workflow-summary.html', 
        'hb!templates/analysis/analysis-launch-empty-summary.html',
        'hb!templates/analysis/plugin-popover-content.html'],
    function($, Backbone, template, emptyTemplate, pluginPopoverTemplate) {
        'use strict';

        /**
         * A summary view of workflow details
         *
         * @type {*}
         */
        var WorkflowSummaryView = Backbone.View.extend({

            model: null,

            template: template,
            emptyTemplate: emptyTemplate,

            initialize: function() {
                this.model = null;
                this.on("render",this._onRender);
            },

            render: function() {
                if (this.model) {
                    var modelAsJson = this.model.toJSON(); 
                    this.$el.html(this.template(modelAsJson));
                    this.$("#selectedPlugins").popover({
                        trigger: "hover", 
                        placement: "top", 
                        content: pluginPopoverTemplate(modelAsJson), 
                        html: true
                    });
                } else {
                    this.$el.html(this.emptyTemplate());
                }
                
                return this;
            },
            
            _onRender: function() {
                var summarySection = this.$(".summary-section");
                summarySection.affix({
                    offset: {
                        top: summarySection.position().top
                    }
                });
                summarySection.width(summarySection.width());
            },

            setModel: function(model) {
                this.model = model;
                return this;
            }

        });

        return WorkflowSummaryView;

    }

);
