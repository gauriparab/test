/*global define:false*/
define([ 'jquery', 'underscore', 'backbone', 'views/samples/manageAttributesGridView', 'views/samples/manageSampleDetailsView','views/samples/editSampleView',
    'views/common/filterView', 'views/common/manageActionsView',  'views/common/confirmModalView',
    'views/common/bannersView', 'views/samples/confirmDeleteSamplesModalView', 'views/common/confirmModalBodyView',
    'views/samples/batchSamplesDetailsView', 'collections/sample/batchSpecimens', 'models/batchresult/BatchResult',
    'views/common/dialog', 'views/loadingView', 'views/analysis/analysisErrorLogFileModalView', 'hb!templates/sample/manage-attributes-overview.html', 'views/common/baseModalView', 'views/samples/manageSampleAddView'],
    function($, _, Backbone, ManageAttributesGridView, ManageSampleDetailsView,EditSampleView , FilterView, ActionsView, Confirm, BannerView,
             ConfirmDeleteSamples, ConfirmBody, BatchSamplesDetailsView, BatchSpecimens, BatchResult, Dialog, LoadingView,AnalysisErrorLogFileModalView, template, BaseModalView, ManageSampleAddView) {
        'use strict';

        /**
         * Sample overview page
         *
         * @type {*}
         */
        var manageSamplesOverview = Backbone.View.extend({

            _template: template,

            _gridEl: '#viewsamples-grid',
            _filterEl: '#flag-filters',
            _actionsEl: '#details-options-menu',
            _batchActionsEl: '#batch-details-options-menu',

            initialize: function(options) {
                options = options || {};

                this._totalSaved = options.totalSaved;
                this._totalInvalid = options.totalInvalid;
                this._importInitiated = options.importInitiated;

                this.gridView = new ManageAttributesGridView();
            },
            events: {
                'click #manageSampleAddBtn': '_onOpenAddSample'
            },

            render: function() {
                this.$el.html(this._template({defineActions : this.options.defineActions }));

                this.gridView.setElement(this.$(this._gridEl)).render();
                this.filterView.setElement(this.$(this._filterEl)).render();
                this.actionsView.setElement(this.$(this._actionsEl));
                this.batchActionsView.setElement(this.$(this._batchActionsEl));

                if (!(_.isUndefined(this._totalSaved) || _.isNull(this._totalSaved))) {
                    new BannerView({
                        id: 'save-success-alert',
                        container: $('.main-content>.container-fluid'),
                        style: 'success',
                        title: $.t('sample.save.success', {
                            sample: {
                                valid: this._totalSaved,
                                total: this._totalSaved + this._totalInvalid
                            }
                        })
                    }).render();
                }

                if(this._importInitiated) {
                    new BannerView({
                        id: 'import-success-alert',
                        container: $('.main-content>.container-fluid'),
                        style: 'success',
                        title: this._importInitiated
                    }).render();
                }
                
            },

            get: function(name) {
                return _.has(this, name) && this[name] || null;
            },
            
            _onGridMultiSelect: function(samples) {
                if (samples.length > 0) {
                    // reset the actions until the ajax call returns with the valid batch actions for the selected analyses
                    this.actionsView
                        .setActions(samples.models[0].get('actions'))
                        .setPrimaryAction(samples.models[0].getPrimaryAction())
                        .render()
                        .show();
                } else {                    
                    this.actionsView.hide();
                }
            },

            _hideBatchActionsView: function() {
                this.$('#batch-summary-section').addClass('hide');
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
                    this.gridView.clearFilter('flag');
                } else {
                    this.gridView.addFilter('flag', filter);
                }
            },

            _onDelete: function() {
                var sampleName = this.detailView.model.get('name'),
                    self = this;
                Confirm.open(function() {
                    self.detailView.model.destroy({
                        success: function() {
                            new BannerView({
                                id: 'success-banner',
                                container: $('.main-content>.container-fluid'),
                                style: 'success',
                                title: $.t('sample.delete.success', { sample: { name: sampleName}})
                            }).render();
                            self.actionsView.$el.hide();
                            self.detailView.destroy();
                            self.gridView.refresh();
                        }
                    });
                }, {}, ConfirmDeleteSamples);
            },

            _onBatchDelete: function() {
                var loadingView = new LoadingView({
                    bodyKey: "batch.samples.delete.processing"
                });
                var samples = this.gridView.getSelected(),
                    self = this,
                    batch = new BatchSpecimens(samples.models),
                    totalSamples = batch.length;
                if (totalSamples) {
                    Dialog.confirm(function() {
                        loadingView.render();
                        batch.destroy().done(function(response) {
                            loadingView.hide();
                            var undeletedSamples = batch.length,
                                deletedSamples = totalSamples - undeletedSamples,
                                batchResult = new BatchResult(response);

                            if (deletedSamples) {
                                BannerView.show({
                                    id: 'success-banner',
                                    container: $('.main-content>.container-fluid'),
                                    style: 'success',
                                    title: $.t('batch.samples.delete.response.success', {
                                        total: totalSamples,
                                        deleted: deletedSamples
                                    })
                                });
                            }

                            if (undeletedSamples) {
                                BannerView.show({
                                    id: 'error-banner',
                                    container: $('.main-content>.container-fluid'),
                                    style: 'error',
                                    sticky: true,
                                    title: $.t('batch.samples.delete.response.error', {
                                        total: totalSamples,
                                        failed: undeletedSamples
                                    }),
                                    messages: batchResult.getErrorMessages()
                                });
                            }

                            self.gridView.clearSelection();
                            self.gridView.clearRow();
                            self.gridView.refresh();
                        });
                    }, {
                        id: 'confirm-batch-delete',
                        headerKey: 'confirm.batch.delete.title',
                        bodyKey: 'batch.samples.delete.confirm'
                    });
                }
            },
            
            delegateEvents: function() {
                Backbone.View.prototype.delegateEvents.apply(this, arguments);

                this.listenTo(this.gridView, 'rowSelect', this._onSelectionChanged);
                this.listenTo(this.gridView, 'unselect', this._onSelectionChanged);
                this.listenTo(this.gridView, 'action:edit', this._onEdit);
            },
            
            _onGridSelect: function(sample) {
                var self = this;
                if (sample) {
                    sample.fetch({
                        success : function() {
                            if (self.editSampleView) {
                                self.editSampleView.destroy();
                                self.editSampleView = null;
                            }
                            self.editSampleView = new EditSampleView({
                                model: sample
                            });
                        }
                    });
                
                    
                }
            
            },
            _onSelectionChanged: function(sample) {
                var self = this;
                self.editSampleView = new EditSampleView({
                    model: sample
                });
            },


            _onEdit: function(e,sample) {
                /*this.editSampleView.render();*/
                /*sample = sample || this.editSampleView.model;*/
                new EditSampleView({
                    completeAction: _.bind(this._onCompleteSampleEdit, this),
                    model: sample
                }).render();
            },
            
            _onCompleteSampleEdit: function(){
                this._displayBanner({
                    titleKey: 'Edit sample done.'
                });
                this.gridView.refresh();
            },
            
            _displayBanner: function(options) {
                options = _.defaults(options, {
                    style: 'success',
                    id: 'success-banner'
                });

                BannerView.show(options);
            },

            _goToPage: function(url) {
                window.location = url;
            },

            _onLock: function() {
                var self = this;
                var lockModel = this.detailView.model;
                var itemType = 'Sample';
                Confirm.open(function() {
                    $.ajax({
                        url: '/ir/secure/api/v40/samples/lock/' + lockModel.id,
                        type: 'POST',
                        noGlobalErrorHandler: true,
                        success : function() {
                            new BannerView({
                                id: 'lock-success-banner',
                                container: $('.main-content>.container-fluid'),
                                style: 'success',
                                title: $.t('item.lock.success', { itemType: itemType, itemName: lockModel.get('name')})
                            }).render();
                            self.actionsView.$el.hide();
                            self.gridView.refresh();
                        },
                        error : function() {
                            new BannerView({
                                id: 'lock-error-banner',
                                container: $('.main-content>.container-fluid'),
                                style: 'error',
                                title: $.t('item.lock.error', { itemType: itemType, itemName: lockModel.get('name')})
                            }).render();
                        }
                    });
                }, {
                    headerKey: $.t('item.lock.header', { itemType: itemType }),
                    warning: $.t('item.lock.warning', { itemType: itemType }),
                    description: $.t('item.lock.confirm', { itemType: itemType }),
                    cancelClass: 'btn-primary'
                }, ConfirmBody);
            },

            _onViewAuditLog: function () {
                window.location = "sample/" + this.detailView.model.id + "/auditLog";
            },

            _onDownloadAuditLog: function () {
                var downloadLocation = "api/v40/sampleAuditLogs/" + this.detailView.model.id + "/download";
                window.open(downloadLocation, '_blank');
            },
            
            _onOpenAddSample: function() {
                new ManageSampleAddView({

                }).render();
            }

        });

        return manageSamplesOverview;
    }
);