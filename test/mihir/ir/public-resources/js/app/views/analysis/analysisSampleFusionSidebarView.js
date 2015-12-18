/*global define:false */
define(['jquery', 'underscore', 'events/eventDispatcher', 'views/analysis/analysisLaunchSampleRelationshipSidebarView',
    'views/analysis/sidebarFusionView'],
    function($, _, dispatcher, RelationshipView, SampleFusionPairedView) {
        'use strict';

        /**
         * The Sidebar for defining fusion pairs during an analysis
         *
         * @type {*}
         */
        var AnalysisSamplesFusionSidebarView = RelationshipView.extend({

            relationshipView: SampleFusionPairedView,

            headerKey: "sample.relationships.fusion"

        });

        return AnalysisSamplesFusionSidebarView;

    }
);
