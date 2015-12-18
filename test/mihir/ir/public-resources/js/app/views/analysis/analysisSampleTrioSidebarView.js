/*global define:false */
define(['jquery', 'underscore', 'events/eventDispatcher', 'views/analysis/analysisLaunchSampleRelationshipSidebarView',
    'views/analysis/sidebarTrioView'],
    function($, _, dispatcher, RelationshipView, SampleTrioView) {
        'use strict';

        /**
         * The Sidebar for defining tumor-normal pairs during an analysis
         *
         * @type {*}
         */
        var AnalysisSamplesTrioSidebarView = RelationshipView.extend({

            relationshipView: SampleTrioView,

            headerKey: "sample.relationships.trio"
        });

        return AnalysisSamplesTrioSidebarView;

    }
);
