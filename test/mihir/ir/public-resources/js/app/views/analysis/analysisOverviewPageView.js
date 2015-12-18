/*global define:false*/
define([ 'jquery',
         'underscore',
         'backbone',
         'handlebars',
         'collections/analysis/batchAnalyses',
         'models/analysis/analysisModel',
         'views/analysis/analysisAbortView',
         'views/analysis/analysisGridView',
         'views/analysis/analysisDetailsView',
         'views/analysis/analysisSendToReportView',
         'views/analysis/analysisShareModalView',
         'views/analysis/batchAnalysisDetailsView',
         'views/analysis/batchAnalysisShareView',
         'views/common/searchView',
         'views/common/filterView',
         'views/common/actionsView',
         'views/common/bannersView',
         'views/analysis/metagenomics/analysisMetagenomicsResultView',
         'views/analysis/analysisActionHandler',
         'events/eventDispatcher',
         'hb!templates/analysis/analysis-overview-page.html',
         'hb!templates/common/versionFilter.html'],
    function($,
             _,
             Backbone,
             Handlebars,
             BatchAnalyses,
             analysisModel,
             AnalysisAbortView,
             AnalysisGridView,
             AnalysisDetailsView,
             AnalysisSendToReportView,
             AnalysisShareModalView,
             BatchAnalysisDetailsView,
             BatchAnalysisShareView,
             SearchView,
             FilterView,
             ActionsView,
             BannerView,
             AnalysisMetagenomicsResultView,
             AnalysisActionHandler,
             dispatcher,
             template,
             versionFilterTemplate) {
        'use strict';

        /**
         * Analysis overview page
         *
         * @type {*}
         */
        var AnalysisOverviewPageView = Backbone.View.extend({

            _template: template,

            _gridEl: '#viewanalysis-grid',
            _searchEl: '#query-form',
            _filterEl: '#filters-pane',
            _versionFilterEl: '#version-filter-pane',
            _typeFilterEl: '#type-filters-pane',
            _actionsEl: '#details-options-menu',
            _batchActionsEl: '#batch-details-options-menu',
            _metagenomicsResultEl: '#metagenomics-result-pane',

            _validOptions: ['canLaunchAnalysis', 'savedAnalysisName', 'hasAnalysisRole', 'flashMessage', 'canSeeSharingDetails'],

            canLaunchAnalysis: false,
            savedAnalysisName: null,
            flashMessage: null,
            canSeeSharingDetails: false,

            initialize: function(options) {
                _.extend(this, _.pick(options || {}, this._validOptions));

                this.router = options.router;

                this.gridView = new AnalysisGridView({
                    actionsEventSource: dispatcher,
                    canPerformBatchActions: options.canPerformBatchActions
                });

                this.searchView = new SearchView();

                this.filterView = new FilterView({
                    url: '/ir/secure/api/v40/analysis/filterOptions',
                    msgKeyPrefix: 'AnalysisSearchOption.',
                    excludes: [
                        'ANY'
                    ],
                    title: $.t('filter.analyses')
                });

                this.versionFilterView = new FilterView({
                    url: '/ir/secure/api/v40/application/versions',
                    title: $.t('filter.version'),
                    template: versionFilterTemplate
                });

                this.typeFilterView = new FilterView({
                    url: '/ir/secure/api/v40/workflows/types',
                    msgKeyPrefix: 'WorkflowApplicationType.',
                    hasIcons: true,
                    title: $.t('filter.application')
                });

                this.actionsView = new ActionsView({
                    msgKeyPrefix: 'AnalysisAction.',
                    primaryActionMsgKeyPrefix: 'AnalysisAction.shortName.',
                    actionsEventSource: dispatcher
                });
                this.batchActionsView = new ActionsView({
                    msgKeyPrefix: 'AnalysisAction.',
                    actionsEventSource: dispatcher
                });

                this.metagenomicsResultView = new AnalysisMetagenomicsResultView();
                this._analysisActionHandler = new AnalysisActionHandler(this, dispatcher);

            },

            delegateEvents: function() {
                Backbone.View.prototype.delegateEvents.apply(this, arguments);

                this.gridView.on('rowSelect', this._onSelectSingleAnalysis, this);
                this.gridView.on('multiSelect', this._onSelectMultipleAnalyses, this);
                this.searchView.on('search', this._onSearch, this);
                this.filterView.on('filter', this._onFilter, this);
                this.versionFilterView.on('filter', this._onVersionFilter, this);
                this.typeFilterView.on('filter', this._onTypeFilter, this);
                this._analysisActionHandler.delegateEvents();
            },

            undelegateEvents: function() {
                this._analysisActionHandler.undelegateEvents();

                this.filterView.off('filter', this._onFilter, this);
                this.versionFilterView.off('filter', this._onVersionFilter, this);
                this.typeFilterView.off('filter', this._onTypeFilter, this);
                this.searchView.off('search', this._onSearch, this);
                this.gridView.off('multiSelect', this._onSelectMultipleAnalyses, this);
                this.gridView.off('rowSelect', this._onSelectSingleAnalysis, this);

                Backbone.View.prototype.undelegateEvents.apply(this, arguments);
            },

            events: {
                'click #refreshData': '_onRefresh'
            },

            render: function() {
                this.$el.html(this._template({
                    canLaunchAnalysis: this.canLaunchAnalysis
                }));
                this.gridView.setElement(this.$(this._gridEl)).render();
                this.searchView.setElement(this.$(this._searchEl)).render();
                this.filterView.setElement(this.$(this._filterEl)).render();
                this.versionFilterView.setElement(this.$(this._versionFilterEl)).render();
                this.typeFilterView.setElement(this.$(this._typeFilterEl)).render();
                this.actionsView.setElement(this.$(this._actionsEl));
                this.batchActionsView.setElement(this.$(this._batchActionsEl));
                this.metagenomicsResultView.setElement(this.$(this._metagenomicsResultEl));

                var summarySection = this.$("#sidebar-container");
                summarySection.affix({
                    offset: {
                        top: summarySection.position().top
                    }
                });
                summarySection.width(summarySection.width());

                if (this.savedAnalysisName) {
                    new BannerView({
                        id: 'launch-success-alert',
                        container: $('.main-content>.container-fluid'),
                        style: 'success',
                        title: $.t('analysis.launch.success', { analysis: { name: this.savedAnalysisName}})
                    }).render();
                }

                if (this.flashMessage) {
                    new BannerView({
                        id: 'success-banner',
                        container: $('.main-content>.container-fluid'),
                        style: 'success',
                        title: this.flashMessage
                    }).render();
                }
            },

            openAbortAnalysisView: function () {
                var self = this,
                    analysisModel = this.detailView.model;

                AnalysisAbortView.openDialog({
                    model: analysisModel
                }, {
                    headerReplacements: {
                        analysisName: analysisModel.get('name')
                    }
                }, function () {
                    new BannerView({
                        id: 'success-banner',
                        container: $('.main-content>.container-fluid'),
                        style: 'success',
                        title: $.t('analysis.abort.success', { analysis: { name: analysisModel.get('name') } })
                    }).render();
                    self.gridView.refresh();
                });
            },

            openShareAnalysisView: function (analysisToShare) {

                AnalysisShareModalView.open({
                    analysis: analysisToShare,
                    onSharingUpdated: _.bind(function() {
                        this._clearAnalysisSelection();
                        this.gridView.refresh();
                    }, this)
                });
            },

            openSendToReportGeneration: function () {
                var self = this,
                    analysisModel = this.detailView.model;

                AnalysisSendToReportView.openDialog({
                    model: analysisModel
                }, {}, function () {
                    new BannerView({
                        id: 'success-banner',
                        container: $('.main-content>.container-fluid'),
                        style: 'success',
                        title: $.t('analysis.sendToReport.success', { analysis: { name: analysisModel.get('name') } })
                    }).render();
                    self.gridView.refresh();
                });
            },

            openShareBatchAnalysisView: function() {
                var self = this,
                    currentSelection = this.gridView.getSelected();

                if (currentSelection.length > 1) {

                    var view = new BatchAnalysisShareView({
                        collection: currentSelection,
                        onSuccess: function(data) {
                            view.hide();
                            self._clearAnalysisSelection();
                            self.gridView.refresh();
                            new BannerView({
                                id: 'share-success-alert',
                                container: $('.main-content>.container-fluid'),
                                style: 'success',
                                title: $.t(data.message)
                            }).render();
                        }
                    }).render();

                }

            },

            _clearAnalysisSelection: function() {
                if (this.detailView) {
                    this.detailView.destroy();
                    this.detailView = null;
                }
                this.actionsView
                    .setActions(null)
                    .setPrimaryAction(null)
                    .render()
                    .hide();

                if (this.batchDetailView) {
                    this.batchDetailView.destroy();
                    this.batchDetailView = null;
                }
                this.gridView.clearSelection({silent: true});
                this._hideBatchActionsView();
            },

            _onSelectSingleAnalysis: function(anAnalysis) {
                if (anAnalysis) {
                    anAnalysis.fetch({
                        success: _.bind(this._onFetchAnalysisSuccess, this)
                    });
                } else {
                    this.$('#summary-section-content').hide();
                    this.actionsView.hide();
                    this.$('.details-help-section').show();
                }
            },

            _onFetchAnalysisSuccess: function(analysis) {
                if (this.detailView) {
                    this.detailView.destroy();
                    this.detailView = null;
                }
                this.$('.details-help-section').hide();
                this.$('#summary-section-content').show();

                this.detailView = new AnalysisDetailsView({
                    el: '#summary-section-content',
                    model: analysis,
                    canSeeSharingDetails: this.canSeeSharingDetails
                }).render();

                this.actionsView
                    .setActions(analysis.getActions())
                    .setPrimaryAction(analysis.getPrimaryAction())
                    .render()
                    .show();

                // IR-8534 Metagenomics analysis uses "download_unfiltered_data" action to download results
                // the following changes the label on action for Metagenomics analyses
                if (analysis.get('applicationType') === 'METAGENOMICS'){
                    this.actionsView.$el.find('a[href="download_unfiltered_data"]').text($.t('AnalysisAction.DOWNLOAD_UNFILTERED_DATA_METAGENOMICS'));
                }
            },

            _onSelectMultipleAnalyses: function(analyses) {
                var self = this;

                if (analyses.length > 1) {
                    // reset the actions until the ajax call returns with the valid batch actions for the selected analyses
                    this.batchActionsView
                        .setActions(null)
                        .setPrimaryAction(null)
                        .render();

                    this.batchDetailView = new BatchAnalysisDetailsView({
                        el: '#batch-summary-section-content',
                        collection: analyses
                    }).render();

                    new BatchAnalyses(analyses.models).getActions(function(actions) {
                        if (actions.length) {
                            self.batchActionsView.renderActions(_.map(actions, function(anAction) {return 'BATCH_' + anAction;}));
                            self.$('#batch-summary-section').show();
                        } else {
                            self._hideBatchActionsView();
                        }
                    });
                } else {
                    this._hideBatchActionsView();
                }
            },

            _hideBatchActionsView: function() {
                this.$('#batch-summary-section').hide();
                this.batchActionsView
                    .setActions(null)
                    .setPrimaryAction(null)
                    .render()
                    .hide();
            },

            _onSearch: function(query) {
                if (_.isEmpty(query)) {
                    this.gridView.clearFilter('q');
                } else {
                    this.gridView.addFilter('q', query);
                }
            },

            _onFilter: function(filter) {
                if (_.isEmpty(filter)) {
                    this.gridView.clearFilter('filter');
                } else {
                    this.gridView.addFilter('filter', filter);
                }
            },

            _onVersionFilter: function(version) {
                if (_.isEmpty(version)) {
                    this.gridView.clearFilter('versionFilter');
                } else {
                    this.gridView.addFilter('versionFilter', version);
                }
            },

            _onTypeFilter: function(type) {
                if (_.isEmpty(type)) {
                    this.gridView.clearFilter('applicationType');
                } else {
                    this.gridView.addFilter('applicationType', type);
                }
            },

            _onRefresh: function() {
                this.gridView.clearSelection();
                this.gridView.refresh();
            }

        });

        return AnalysisOverviewPageView;

    }
);