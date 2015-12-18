/*global define:false */
define(['jquery', 'underscore', 'kendo', 'views/templateView', 'hb!templates/analysis/batch-analysis-details.html', 
        'hb!templates/analysis/no-analysis-details.html'],
    function($, _, kendo, TemplateView, template, noSelectionTemplate) {
        'use strict';

        /**
         * A view of details for multiple analyses.
         *
         * @type {*}
         */
        var BatchAnalysisDetailsView = TemplateView.extend({

            template: template,

            /**
             * Render the template inside container. Add a popover on attachments.
             */
            render: function() {
                if (this.collection.length > 0) {
                    this.$el.html(this.template({
                        analyses: this.collection.toJSON()
                    }));
                } else {
                    this._renderNoSelection();
                }

                return this;
            },

            destroy: function() {
                this.collection.reset();
                this.stopListening();
                this.undelegateEvents();
                this._renderNoSelection();
                
                return this;
            },
            
            _renderNoSelection: function() {
                this.$el.html(noSelectionTemplate());
            }

        });

        return BatchAnalysisDetailsView;

    }

);
