/*global define:false */
define(['views/analysis/sidebarPairedView'],
    function(PairedView) {
        'use strict';

        /**
         * A summary view of Analysis details
         *
         * @type {*}
         */
        var AnalysisSamplesPairedView = PairedView.extend({

            /*
             * The type of the relationship to set on the SpecimenGroups that are created.
             */
            _relationshipType: "PAIRED_TUMOR_NORMAL",
            
            _sampleOneRole: "TUMOR",
            _sampleTwoRole: "NORMAL"

        });

        return AnalysisSamplesPairedView;

    });
