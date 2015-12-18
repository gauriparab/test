/*global define:false*/
define([
    'jquery',
    'underscore',
    'views/analysis/analysisLaunchSampleRelationshipsView',
    'views/analysis/analysisLaunchFusionSampleGridView'
], function(
    $,
    _,
    AnalysisSamplesView,
    SampleGridView) {

    'use strict';

    var FusionSamplesView = AnalysisSamplesView.extend({

        _gridCls: SampleGridView,

        initialize: function(options) {
            AnalysisSamplesView.prototype.initialize.call(this, _.extend(options || {}, {
                infoBanner: 'analysis.launch.samples.DNA_RNA_FUSION.info'
            }));

            // release this event binding so that we may select across pages
            this.gridView.off('dataBound', this._clearSelected, this);
        }

    });

    return FusionSamplesView;
});
