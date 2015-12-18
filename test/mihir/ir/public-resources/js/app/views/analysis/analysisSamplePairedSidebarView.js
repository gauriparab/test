/*global define:false */
define(['jquery', 'underscore', 'events/eventDispatcher', 'views/analysis/analysisLaunchSampleRelationshipSidebarView',
    'views/analysis/sidebarPairedView'],
    function($, _, dispatcher, RelationshipView, SamplePairedView) {
        'use strict';

        /**
         * The Sidebar for defining tumor-normal pairs during an analysis
         *
         * @type {*}
         */
        var AnalysisSamplesPairedSidebarView = RelationshipView.extend({

            relationshipView: SamplePairedView,

            headerKey: "sample.relationships.paired"

        });

        return AnalysisSamplesPairedSidebarView;

    }
);
