/*global define:false*/
define(['underscore',
    'data/workflow',
    'models/analysis/analysisModel',
    'wizard/wizard',
    'events/eventDispatcher',
    'views/wizard/wizardView'],

    function(_, Constants, AnalysisModel, Wizard, dispatcher, WizardView) {
        'use strict';

        var defaultSampleRelationShipSettings = {
            url: '#samples',
            title: 'Samples & Relationships',
            identifier: 'SAMPLES',
            detailsPage: 'views/analysis/analysisLaunchSampleRelationshipsView',
            validations: ['specimenGroups', 'duplicateSpecimenGroups']
        };

        var TABS = {
            WORKFLOW: {
                url: '#workflow',
                title: 'Workflow',
                identifier: 'WORKFLOW',
                detailsPage: 'views/analysis/analysisLaunchWorkflowsView',
                sidebarPage: 'views/analysis/analysisLaunchWorkflowSummaryView',
                validations: ['workflow']
            },
            SINGLE_SAMPLES: _.defaults({
                title: 'Samples',
                detailsPage: 'views/analysis/analysisLaunchSingleSamplesView',
                sidebarPage: 'views/analysis/analysisSummaryView',
                validations: ['specimenGroup']
            }, defaultSampleRelationShipSettings),
            MULTI_SAMPLES: _.defaults({
                title: 'Samples',
                detailsPage: 'views/analysis/analysisLaunchMultiSamplesView',
                sidebarPage: 'views/analysis/analysisSummaryView',
                validations: ['specimenGroup']
            }, defaultSampleRelationShipSettings),
            PAIRED_SAMPLES: _.defaults({
                sidebarPage: 'views/analysis/analysisSamplePairedSidebarView'
            }, defaultSampleRelationShipSettings),
            PAIRED_TUMOR_SAMPLES: _.defaults({
                sidebarPage: 'views/analysis/analysisSamplePairedTNSidebarView'
            }, defaultSampleRelationShipSettings),
            TRIO_SAMPLES: _.defaults({
                sidebarPage: 'views/analysis/analysisSampleTrioSidebarView'
            }, defaultSampleRelationShipSettings),
            FUSION_SAMPLES: _.defaults({
                title: 'Samples',
                detailsPage: 'views/analysis/analysisLaunchFusionSamplesView',
                sidebarPage: 'views/analysis/analysisSampleFusionSidebarView'
            }, defaultSampleRelationShipSettings),
            
            PLUGINS: {
                url: '#plugins',
                title: 'Plugins',
                identifier: 'PLUGINS',
                detailsPage: 'views/analysis/analysisLaunchPluginsView',
                sidebarPage: 'views/analysis/analysisSummaryView'
            },
            CONFIRM: {
                url: '#confirm',
                title: 'Confirm & Launch',
                identifier: 'CONFIRM',
                detailsPage: 'views/analysis/analysisLaunchConfirmView',
                sidebarPage: 'views/analysis/analysisSummaryView'
            }
        };

        Object.freeze(TABS);

        var wizardSteps = {};
        wizardSteps[Constants.SpecimenGroups.SINGLE.identifier] =
            [TABS.WORKFLOW, TABS.SINGLE_SAMPLES, TABS.PLUGINS, TABS.CONFIRM];
        wizardSteps[Constants.SpecimenGroups.SINGLE_RNA_FUSION.identifier] =
            [TABS.WORKFLOW, TABS.SINGLE_SAMPLES, TABS.PLUGINS, TABS.CONFIRM];
        wizardSteps[Constants.SpecimenGroups.PAIRED.identifier] =
            [TABS.WORKFLOW, TABS.PAIRED_SAMPLES, TABS.PLUGINS, TABS.CONFIRM];
        wizardSteps[Constants.SpecimenGroups.PAIRED_TUMOR_NORMAL.identifier] =
            [TABS.WORKFLOW, TABS.PAIRED_TUMOR_SAMPLES, TABS.PLUGINS, TABS.CONFIRM];
        wizardSteps[Constants.SpecimenGroups.TRIO.identifier] =
            [TABS.WORKFLOW, TABS.TRIO_SAMPLES, TABS.PLUGINS, TABS.CONFIRM];
        wizardSteps[Constants.SpecimenGroups.MULTI.identifier] =
            [TABS.WORKFLOW, TABS.MULTI_SAMPLES, TABS.PLUGINS, TABS.CONFIRM];
        wizardSteps[Constants.SpecimenGroups.DNA_RNA_FUSION.identifier] =
            [TABS.WORKFLOW, TABS.FUSION_SAMPLES, TABS.PLUGINS, TABS.CONFIRM];
        Object.freeze(wizardSteps);

        /**
         * Analysis launch wizard page
         *
         * @type {*}
         */
        var AnalysisLaunchWizardPageView = WizardView.extend({

            _validOptions: ['el'],

            initialize: function(options) {
                _.extend(this, _.pick(options || {}, this._validOptions));

                this._analysisModel = new AnalysisModel({
                    name: 'Analysis_' + (+new Date())
                });
                
                options.wizard = new Wizard({
                    model: this._analysisModel,
                    pages: wizardSteps[Constants.SpecimenGroups.SINGLE.identifier],
                    cancelPath: 'analyses.html'
                });

                WizardView.prototype.initialize.apply(this, arguments);
            },

            delegateEvents: function() {
                var self = this;
                WizardView.prototype.delegateEvents.apply(this, arguments);
                dispatcher.listenTo(self._analysisModel, 'change:workflow', function(analysis, workflow) {
                    var pages = wizardSteps[workflow.getSpecimenGroup()];
                    // remove the plugins tab for metagenomics workflows
                    if (workflow.getApplicationType() === 'METAGENOMICS') {
                        pages = _.reject(pages, function(p) {
                            return p.identifier === 'PLUGINS';
                        });
                    }
                    self._wizard.set('pages', pages);
                });
            }
        });

        return AnalysisLaunchWizardPageView;

    }
);
