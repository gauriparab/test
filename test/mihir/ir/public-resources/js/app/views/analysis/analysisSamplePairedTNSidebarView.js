/*global define:false */
define(['jquery', 'underscore', 'events/eventDispatcher', 'views/analysis/analysisLaunchSampleRelationshipSidebarView', 
    'views/analysis/sidebarPairedTNView'],
    function($, _, dispatcher, RelationshipView, SamplePairedTNView) {
        'use strict';

        /**
         * The Sidebar for defining tumor-normal pairs during an analysis
         *
         * @type {*}
         */
        var AnalysisSamplesPairedTNSidebarView = RelationshipView.extend({
            
            relationshipView: SamplePairedTNView,
            
            headerKey: "sample.relationships.pairedTN"
            
        });

        return AnalysisSamplesPairedTNSidebarView;

    }
);
