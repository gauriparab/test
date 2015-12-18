/*global define:false */
define(['jquery', 'underscore', 'views/templateView', 'hb!templates/sample/batch-samples-details.html'],
    function($, _, TemplateView, template) {
        'use strict';

        /**
         * A view of details for multiple samples.
         *
         * @type {*}
         */
        var BatchSamplesDetailsView = TemplateView.extend({

            template: template,

            /**
             * Render the template inside container.
             */
            render: function() {
                this.$el.html(this.template({
                    samples: this.collection.toJSON()
                }));
                return this;
            }

        });

        return BatchSamplesDetailsView;

    }

);
