/*global define:false*/
define(['jquery', 'underscore', 
        'models/analysis/batchAnalysisFile', 'models/analysis/batchAnalysis',
        'views/templateView', 'views/common/bannersView', 'views/analysis/batchAnalysesView',
        'views/analysis/analysisPurchaseConfirmationView', 'events/eventDispatcher', 'views/fileUpload', 
        'views/loadingView',
        'hb!templates/analysis/batch-analysis-launch-page.html',
        'hb!templates/common/spinner.html']
        .concat('bootstrap.fileupload', 'bootstrap.modal', 'bootstrap.modalmanager'),
        function($, _, BatchAnalysisFile, BatchAnalysis, TemplateView, BannerView, BatchAnalysesView, 
                PurchaseConfirmationView, dispatcher, FileUploadView, LoadingView, template, Spinner) {
        'use strict';

        var ANALYSES_OVERVIEW_URL = '/ir/secure/analyses.html';

        /**
         * Batch launch page.
         *
         * @type {*}
         */
        var BatchAnalysisLaunchPageView = TemplateView.extend({

            _purchaseConfirmationView: null,

            events: {
                'click #upload': '_handleFileUpload',
                'click #start-batch > button': '_startBatchAnalysis'
            },
            
            initialize: function(opts) {
                var options = opts || {};
                
                this._canLaunchAnalysis = options.canLaunchAnalysis;

                _.bindAll.apply(this, [this].concat(_.chain(this).functions().filter(function(val) {
                    return val.indexOf('_on') === 0;
                }).value()));
                
                this._fileUploadView = new FileUploadView({
                    uploadUrl: '/ir/secure/api/v40/batch_analysis/upload/file',
                    model: new BatchAnalysisFile(),
                    invalidFileMessageKey: $.t('batch.analysis.invalid.file'),
                    statusErrorMessageKey: $.t('batch.analysis.status.error')
                });
                
                this._batchAnalysesView = new BatchAnalysesView();
            },
            
            delegateEvents: function() {
                TemplateView.prototype.delegateEvents.apply(this, arguments);
                this.listenTo(this._fileUploadView, 'upload:validationSuccessful', this._onUploadComplete);
                this.listenTo(this._fileUploadView, 'upload:validationFailed', this._onUploadFailed);
                this.listenTo(this._fileUploadView, 'upload:uploadFailed', this._onUploadFailed);
                this.listenTo(this._fileUploadView, 'upload:uploadError', this._onUploadFailed);
            },
            
            undelegateEvents: function() {
                this.stopListening(this._fileUploadView);
                TemplateView.prototype.undelegateEvents.apply(this, arguments);
            },
            
            _onUploadComplete: function(batchAnalysisFile) {
                this._batchAnalysisFile = batchAnalysisFile;
                this._retrieveBatchAnalyses();
            },

            _onUploadFailed: function() {
                this.$('#batch-analyses').empty();
            },

            render: function() {
                this.$el.html(template({
                    canLaunchAnalysis: this._canLaunchAnalysis
                }));

                this.renderSubView(this._fileUploadView, "#importFileUpload");
                
                this._showStartButton();

                return this;
            },

            _showStartButton: function() {
                var show = this._batchAnalysis && this._batchAnalysis.getLaunchables().length > 0;
                this.$('#start-batch').toggle(show);
            },
            
            _retrieveBatchAnalyses: function() {
                this.$('#batch-analyses').html($.t('loading.wait') + Spinner());
                var batchAnalysis = new BatchAnalysis();
                batchAnalysis.fetchBatchAnalyses(this._batchAnalysisFile,
                        this._onSuccessfulFetchBatchAnalyses,
                        this._onFailureFetchBatchAnalyses);
            },

            _onSuccessfulFetchBatchAnalyses: function(model) {
                this._batchAnalysis = model;
                dispatcher.trigger('updateBatchAnalysis', this._batchAnalysis);
                this.renderSubView(this._batchAnalysesView, '#batch-analyses');
                this._showStartButton();
            },

            _onFailureFetchBatchAnalyses: function() {
                this.$('#batch-analyses').empty();
                BannerView.show({
                    id: 'error-banner',
                    style: 'error',
                    title: $.t('batch.analysis.get.error')
                });
            },
            
            _startBatchAnalysis: function(e) {
                e.preventDefault();
                this._setLaunchButton(false);
                if (this._batchAnalysis.getInvoice().hasChargeableItems()) {
                    // confirm purchase
                    this._confirmPurchase();
                } else {
                    // launch valid analyses
                    this._launchAllAnalyses();
                }
            },

            _launchAllAnalyses: function() {
                var self = this,
                    loadingView = this._displayLaunchInProgress();
                $.ajax({
                    url: '/ir/secure/api/v40/analysis/launch',
                    type: 'POST',
                    data: JSON.stringify(this._createLaunchRequest()),
                    dataType: 'json',
                    contentType: 'application/json',
                    noGlobalErrorHandler: true,
                    timeout: parseInt($.t('analysis.error.timeout.value'), 10)
                })
                .done(this._onLaunchSuccess)
                .always(function() {
                    loadingView.hide();
                    self._setLaunchButton(true);
                });
            },

            _displayLaunchInProgress: function() {
                return new LoadingView({
                    bodyKey: 'loading.batch.launch'
                }).render();
            },
            
            _createLaunchRequest: function() {
                return {
                    analysisList: this._batchAnalysis.getLaunchables(),
                    invoice: this._batchAnalysis.getInvoice().toJSON()
                };
            },

            _onLaunchSuccess: function() {
                this.$('#error').hide();
                window.location = ANALYSES_OVERVIEW_URL;
            },

            _confirmPurchase: function() {
                var self = this,
                    confirmAndLaunch = function() {
                        self._launchAllAnalyses();
                    };
                if (this._purchaseConfirmationView) {
                    this._purchaseConfirmationView.undelegateEvents();
                }
                this._purchaseConfirmationView = new PurchaseConfirmationView({
                        el: '#confirm-launch-modal',
                        model: this._batchAnalysis.getPurchaseOrder(),
                        invoice: this._batchAnalysis.getInvoice(),
                        onConfirm: confirmAndLaunch,
                        onCancel: _.bind(this._setLaunchButton, this, true)
                    });
                this._purchaseConfirmationView.render().$el.modal({
                    width: 700,
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true
                });
            },

            _setLaunchButton: function(enabled) {
                this.$('#start-batch>button').prop('disabled', !enabled);
            }

        });

        return BatchAnalysisLaunchPageView;

    }
);
