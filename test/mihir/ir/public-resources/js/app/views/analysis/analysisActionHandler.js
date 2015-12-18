/*global define:false*/
define([ 'jquery',
         'underscore',
         'backbone',
         'views/common/confirmModalView',
         'views/analysis/confirmDeleteAnalysisModalView',
         'views/analysis/confirmSendBackAnalysisModalView',
         'views/common/bannersView',
         'views/loadingView',
         'collections/analysis/batchAnalyses',
         'views/common/dialog',
         'models/batchresult/BatchResult'
         ]
    .concat('jqFileDownload'),
    function($,
             _,
             Backbone,
             Confirm,
             ConfirmDeleteAnalysis,
             ConfirmSendBackAnalysis,
             BannerView,
             LoadingView,
             BatchAnalyses,
             Dialog,
             BatchResult) {
        'use strict';

        var AnalysisActionHandler = function(analysisOverViewPage, actionsEventSource) {
            this.analysisOverViewPage = analysisOverViewPage;
            this._actionsEventSource = actionsEventSource;
            this._listener = _.extend({}, Backbone.Events);
        };

        AnalysisActionHandler.prototype._routerEvents = function() {
            return {
                'route:default': this._onViewOverview,
                'route:metagenomics': this._onRouteToMetagenomics
            };
        };

        AnalysisActionHandler.prototype._actionEvents = function() {
            return {
                'action:delete': this._onDelete,
                'action:edit_variants': this._onEdit,
                'action:view_variants': this._onView,
                'action:edit': this._onEdit,
                'action:share': this._onShare,
                'action:download_filtered_data': this._onDownloadFiltered,
                'action:download_unfiltered_data': this._onDownloadUnfiltered,
                'action:send_back_to_variant_review': this._onSendBack,
                'action:view_metagenomics': this._onViewMetagenomics,
                'action:view_qc_report': this._viewQcReport,
                'action:view_final_report': this._viewFinalReport,
                'action:send_to_report_generation': this._sendToReportGeneration,
                'action:audit_log': this._auditLog,
                'action:export_analysis_log_file': this._exportLog,
                'action:abort': this._abort,
                'action:visualize': this._onVisualize
            };
        };

        AnalysisActionHandler.prototype._batchActionEvents = function() {
            return {
                'action:batch_export': this._onBatchDownload,
                'action:batch_share': this._onBatchShare,
                'action:batch_visualize' : this._onBatchVisualize,
                'action:batch_delete': this._onBatchDelete
            };
        };

        AnalysisActionHandler.prototype.delegateEvents = function() {
            _.each(this._routerEvents(), function(eventHandler, event) {
                this.analysisOverViewPage.router.on(event, eventHandler, this);
            }, this);

            _.each(this._actionEvents(), function(eventHandler, event) {
                this._listener.listenTo(this._actionsEventSource, event, _.bind(eventHandler, this));
            }, this);

            _.each(this._batchActionEvents(), function(eventHandler, event) {
                this._listener.listenTo(this._actionsEventSource, event, _.bind(eventHandler, this));
            }, this);
        };

        AnalysisActionHandler.prototype.undelegateEvents = function() {
            _.each(this._routerEvents(), function(eventHandler, event) {
                this.analysisOverViewPage.router.off(event);
            }, this);

            this._listener.stopListening(this._actionsEventSource);
        };

        AnalysisActionHandler.prototype._onDelete = function() {
            var model = this._getSelectedAnalysisModel();
            Confirm.open(_.bind(this._deleteAnalysis, this, model), {}, ConfirmDeleteAnalysis);
        };

        AnalysisActionHandler.prototype._onBatchDelete = function() {
            var spinnerView = new LoadingView({
                bodyKey: "batch.analysis.delete.processing"
            });
            var collection = this.analysisOverViewPage.batchDetailView.collection,
                self = this,
                batch = new BatchAnalyses(collection.models),
                totalAnalyses = batch.length;
            if (totalAnalyses) {
                Dialog.confirm(function() {
                    spinnerView.render();
                    batch.destroy().done(function(response) {
                        spinnerView.hide();
                        var undeletedAnalyses = batch.length,
                            deletedAnalyses = totalAnalyses - undeletedAnalyses,
                            batchResult = new BatchResult(response);

                        if (deletedAnalyses) {
                            BannerView.show({
                                id: 'success-banner',
                                container: $('.main-content>.container-fluid'),
                                style: 'success',
                                title: $.t('batch.analysis.delete.response.success', {
                                    total: totalAnalyses,
                                    deleted: deletedAnalyses
                                })
                            });
                        }

                        if (undeletedAnalyses) {
                            BannerView.show({
                                id: 'error-banner',
                                container: $('.main-content>.container-fluid'),
                                style: 'error',
                                sticky: true,
                                title: $.t('batch.analysis.delete.response.error', {
                                    total: totalAnalyses,
                                    failed: undeletedAnalyses
                                }),
                                messages: batchResult.getErrorMessages()
                            });
                        }

                        self.analysisOverViewPage.gridView.clearSelection();
                        self.analysisOverViewPage.gridView.clearRow();
                        self.analysisOverViewPage.gridView.refresh();
                    });
                }, {
                    id: 'confirm-batch-delete',
                    headerKey: 'confirm.batch.delete.title',
                    bodyKey: 'batch.analysis.delete.confirm'
                });
            }
        };

        AnalysisActionHandler.prototype._deleteAnalysis = function(analysis) {
            var self = this,
                analysisName = analysis && analysis.get('name') || '';
            analysis.destroy({
                success: function() {
                    new BannerView({
                        id: 'success-banner',
                        container: $('.main-content>.container-fluid'),
                        style: 'success',
                        title: $.t('analysis.delete.success', { analysis: { name: analysisName}})
                    }).render();

                    self.analysisOverViewPage.actionsView.$el.hide();
                    self.analysisOverViewPage.detailView.destroy();
                    self.analysisOverViewPage.gridView.clearSelection();
                    self.analysisOverViewPage.gridView.refresh();
                }
            });
        };

        AnalysisActionHandler.prototype._getSelectedAnalysisModel = function() {
            return this.analysisOverViewPage.detailView && this.analysisOverViewPage.detailView.model;
        };

        AnalysisActionHandler.prototype._getSelectedAnalysisModelId = function() {
            var selectedAnalysis = this._getSelectedAnalysisModel();
            return selectedAnalysis && selectedAnalysis.get('id') || null;
        };

        AnalysisActionHandler.prototype._onEdit = function(e, analysis) {
            var analysisId = analysis ? analysis.get('id') : this._getSelectedAnalysisModelId();
            if (analysisId) {
                this._redirectTo('/ir/secure/analyses/' + analysisId + '/edit_variants');
            }
        };

        AnalysisActionHandler.prototype._onView = function(e, analysis) {
            var analysisId = analysis ? analysis.get('id') : this._getSelectedAnalysisModelId();
            if (analysisId) {
                this._redirectTo('/ir/secure/analyses/' + analysisId + '/view_variants');
            }
        };

        AnalysisActionHandler.prototype._onShare = function() {
            var analysis = this._getSelectedAnalysisModel();
            if (analysis && analysis.get('id')) {
                this.analysisOverViewPage.openShareAnalysisView(analysis);
            }
        };

        AnalysisActionHandler.prototype._onVisualize = function() {
            var analysisId = this._getCurrentAnalysisId();
            this._redirectTo('/ir/secure/analyses/visualization.html?ids=' + encodeURIComponent(analysisId));
        };

        AnalysisActionHandler.prototype._sendToReportGeneration = function () {
            var analysisId = this._getSelectedAnalysisModelId();
            if (analysisId) {
                this.analysisOverViewPage.openSendToReportGeneration();
            }
        };

        AnalysisActionHandler.prototype._onBatchDownload = function() {
            var analysisIds = this._getIdParams(this.analysisOverViewPage.batchDetailView.collection);
            this._downloadData('/ir/secure/analyses/batch_download_data?ids=' + encodeURIComponent(analysisIds),
                    'batch.analysis.export.processing');
        };

        AnalysisActionHandler.prototype._onBatchShare = function() {
            this.analysisOverViewPage.openShareBatchAnalysisView();
        };

        AnalysisActionHandler.prototype._onBatchVisualize = function() {
            var analysisIds = this._getIdParams(this.analysisOverViewPage.batchDetailView.collection);
            this._redirectTo('/ir/secure/analyses/visualization.html?ids=' + encodeURIComponent(analysisIds));
        };

        AnalysisActionHandler.prototype._onDownloadFiltered = function() {
            this._downloadData('/ir/secure/analyses/' + this._getCurrentAnalysisId() + '/download_filtered_data',
                'analysis.export.processing');
        };

        AnalysisActionHandler.prototype._onDownloadUnfiltered = function() {
            this._downloadData('/ir/secure/analyses/' + this._getCurrentAnalysisId() + '/download_unfiltered_data',
                'analysis.export.processing');
        };

        AnalysisActionHandler.prototype._downloadData = function(url, loadingViewKey) {
            var loadingView = new LoadingView({
                bodyKey: loadingViewKey
            });
            loadingView.render();
            $.fileDownload(url, {
                successCallback: function() {
                    loadingView.hide();
                },
                failCallback: function() {
                    loadingView.hide();
                    new BannerView({
                        id: 'error-banner',
                        container: $('.main-content>.container-fluid'),
                        style: 'error',
                        title: $.t('exception.msg.public.default')
                    }).render();
                }
            });
        };

        AnalysisActionHandler.prototype._viewQcReport = function() {
            this._redirectTo('/ir/secure/analyses/' + this._getCurrentAnalysisId() + '/view_qc_report');
        };

        AnalysisActionHandler.prototype._viewFinalReport = function() {
            this._redirectTo('/ir/secure/analyses/' + this._getCurrentAnalysisId() + '/view_final_report.html');
        };

        AnalysisActionHandler.prototype._getCurrentAnalysisId = function() {
            return this._getSelectedAnalysisModel().get('id');
        };

        AnalysisActionHandler.prototype._auditLog = function() {
            window.location = '/ir/secure/analyses/' + this._getCurrentAnalysisId() + '/audit_log';
        };

        AnalysisActionHandler.prototype._exportLog = function() {
            window.location = '/ir/secure/analyses/' + this._getCurrentAnalysisId() + '/download_log';
        };

        AnalysisActionHandler.prototype._abort = function() {
            this.analysisOverViewPage.openAbortAnalysisView();
        };

        AnalysisActionHandler.prototype._onViewOverview = function() {
            this.analysisOverViewPage.$('.tab-content>.active').removeClass('active');
            this.analysisOverViewPage.$('#overview-pane').addClass('active');
            this.analysisOverViewPage.$('#launch-analysis-options').show();
        };

        AnalysisActionHandler.prototype._onRouteToMetagenomics = function(analysisId) {
            var modelId;
            if (!this.analysisOverViewPage) {
                return;
            }
            modelId = analysisId || this._getSelectedAnalysisModelId();
            if (!modelId) {
                this.analysisOverViewPage.router.navigate('', {trigger: true});
                return;
            }

            var self = this,
                urlBase =  '/ir/secure/analyses/' + modelId + '/metagenomics';

            $.ajax({
                url: urlBase,
                type: 'GET',
                success: function(data) {
                    self.analysisOverViewPage.metagenomicsResultView
                        .setLaunchURL(urlBase + '/' + data)
                        .render();
                    self.analysisOverViewPage.$('.tab-content>.active').removeClass('active');
                    self.analysisOverViewPage.$('#metagenomics-result-pane').addClass('active');
                    self.analysisOverViewPage.$('#launch-analysis-options').hide();
                    self.analysisOverViewPage.$("#analysesOverviewSwitchToAuditLog").attr("href", "/ir/secure/analyses/"+modelId+"/audit_log");
                    self.analysisOverViewPage.$('#analysisOverviewSwitchToBtn').show();
                }
            });
        };

        AnalysisActionHandler.prototype._onSendBack = function() {
            var model = this._getSelectedAnalysisModel();
            Confirm.open(_.bind(this._sendBack, this, model), {}, ConfirmSendBackAnalysis);
        };

        AnalysisActionHandler.prototype._sendBack = function(analysis) {
            var self = this,
                analysisName = analysis.get('name'),
                analysisId = analysis.get('id');
            $.ajax({
                url: '/ir/secure/api/v40/analysis/' + analysisId + '/send_back_to_variant_review',
                type: 'GET',
                success : function() {
                    new BannerView({
                        id: 'success-banner',
                        container: $('.main-content>.container-fluid'),
                        style: 'success',
                        title: $.t('analysis.sendBack.success', { analysis: { name: analysisName}})
                    }).render();
                    self.analysisOverViewPage.actionsView.$el.hide();
                    self.analysisOverViewPage.detailView.destroy();
                    self.analysisOverViewPage.gridView.clearSelection();
                    self.analysisOverViewPage.gridView.refresh();
                },
                error : function() {
                    new BannerView({
                        id: 'error-banner',
                        container: $('.main-content>.container-fluid'),
                        style: 'error',
                        title: $.t('analysis.sendBack.error', { analysis: { name: analysisName}})
                    }).render();
                }
            });
        };

        AnalysisActionHandler.prototype._onViewMetagenomics = function(e, analysis) {
            var navigateTo = 'metagenomics';
            if (analysis && analysis.get('id')) {
                navigateTo += '/' + analysis.get('id');
            }
            this.analysisOverViewPage.router.navigate(navigateTo, {trigger: true});
        };


        AnalysisActionHandler.prototype._redirectTo = function(destUrl) {
            this.analysisOverViewPage.undelegateEvents();
            window.location = destUrl;
        };

        AnalysisActionHandler.prototype._getIdParams = function(collection) {
            return _.map(collection.toJSON(),
                function(objWithId) {
                    return objWithId.id;
                }).join(',');
        };

        return AnalysisActionHandler;

    }
);