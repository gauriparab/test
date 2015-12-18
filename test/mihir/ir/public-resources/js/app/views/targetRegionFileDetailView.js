/*global define:false */
define([ 'jquery', 'underscore', 'hb!templates/target-region-file-detail.html', 'views/templateView', 'hb!templates/grid/grid-column-locked.html', 
        'hb!templates/grid/grid-column-provided.html'],

function($, _, template, TemplateView, lockedColumnTemplate, providedColumnTemplate) {

    'use strict';

    /**
     * A view of TargetRegionFile details
     * 
     * @type {*}
     */
    var TargetRegionFileDetailView = TemplateView.extend({

        template : template,

        _subTemplates : {
            locked : lockedColumnTemplate,
            provided : providedColumnTemplate
        },

        /**
         * Render the template inside container.
         */
        render : function() {
            var self = this;
            this.model.fetch({
                success : function() {
                    self.$el.html(self.template(_.extend(self.model.toJSON(), {
                        sub : self._subTemplates
                    })));
                }
            });
        }

    });

    return TargetRegionFileDetailView;

});
