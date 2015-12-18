/*global define:false */
define(['jquery', 'underscore', 'views/templateView', 'hb!templates/workflow/batch-workflows-details.html'],
    function($, _, TemplateView, template) {
        'use strict';

        /**
         * A view of details for multiple workflows.
         *
         * @type {*}
         */
        var BatchWorkflowsDetailsView = TemplateView.extend({

            template: template,

            /**
             * Render the template inside container.
             */
            render: function() {
                this.$el.html(this.template({
                    workflows: this.collection.toJSON()
                }));
                return this;
            }

        });

        return BatchWorkflowsDetailsView;

    }

);
