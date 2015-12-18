/*global define:false*/
define(['views/templateView', 'hb!templates/analysis/analysis-launch-relationships.html'],
    function(TemplateView, template) {
        'use strict';

        var RelationshipsView = TemplateView.extend({

            template: template

        });

        return RelationshipsView;

    }
);