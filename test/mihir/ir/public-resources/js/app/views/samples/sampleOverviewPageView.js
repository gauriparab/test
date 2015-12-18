/*global define:false*/
define([ 'jquery', 'underscore', 'backbone', 'views/samples/sampleGridView', 'views/samples/sampleDetailsView',
    'views/common/searchView', 'views/common/filterView', 'views/common/actionsView',  'views/common/confirmModalView',
    'views/common/bannersView', 'views/samples/confirmDeleteSamplesModalView', 'views/common/confirmModalBodyView',
    'views/samples/batchSamplesDetailsView', 'collections/sample/batchSpecimens', 'models/batchresult/BatchResult',
    'views/common/dialog', 'views/loadingView', 'hb!templates/sample/sample-overview-page.html'],
    function($, _, Backbone, SampleGridView, SampleDetailsView, SearchView, FilterView, ActionsView, Confirm, BannerView,
             ConfirmDeleteSamples, ConfirmBody, BatchSamplesDetailsView, BatchSpecimens, BatchResult, Dialog, LoadingView, template) {
        'use strict';

        /**
         * Sample overview page
         *
         * @type {*}
         */
        var SampleOverviewPageView = Backbone.View.extend({

            _template: template,

            _gridEl: '#viewsamples-grid',
            _searchEl: '#query-form',
            _filterEl: '#flag-filters',
            _actionsEl: '#details-options-menu',
            _batchActionsEl: '#batch-details-options-menu',

            initialize: function(options) {
                options = options || {};

                this._totalSaved = options.totalSaved;
                this._totalInvalid = options.totalInvalid;
                this._importInitiated = options.importInitiated;

                this.gridView = new SampleGridView({
                    canPerformBatchActions: options.canPerformBatchActions
                });

                this.gridView.on('rowSelect', this._onGridSelect, this);
                this.gridView.on('multiSelect', this._onGridMultiSelect, this);
                this.gridView.on('action:edit', this._onEdit, this);

                this.searchView = new SearchView();
                this.searchView.on('search', this._onSearch, this);

                this.filterView = new FilterView({
                    filters: [ /*'Flagged', */'Unanalyzed' ],
                    title: $.t('filter.samples')
                });
                this.filterView.on('filter', this._onFilter, this);

                this.actionsView = new ActionsView({
                    msgKeyPrefix: 'SampleAction.'
                });

                this.batchActionsView = new ActionsView({
                    msgKeyPrefix: 'SampleAction.'
                });

                this.actionsView.on('action:delete', this._onDelete, this);
                this.actionsView.on('action:edit', this._onEdit, this);
                this.actionsView.on('action:lock', this._onLock, this);
                this.actionsView.on('action:view_audit_log', this._onViewAuditLog, this);
                this.actionsView.on('action:export_audit_log', this._onDownloadAuditLog, this);

                this.batchActionsView.on('action:batch_delete', this._onBatchDelete, this);
            },

            render: function() {
                this.$el.html(this._template({defineActions : this.options.defineActions }));

                this.gridView.setElement(this.$(this._gridEl)).render();
                this.searchView.setElement(this.$(this._searchEl)).render();
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

                var summarySection = $(".summary-section");
                summarySection.affix({
                    offset: {
                        top: summarySection.position().top
                    }
                });
            },

            get: function(name) {
                return _.has(this, name) && this[name] || null;
            },

            _onGridSelect: function(model) {
                var self = this;
                if (model) {
                    model.fetch({
                        success : function() {
                            if (self.detailView) {
                                self.detailView.destroy();
                                self.detailView = null;
                            }
                            self.$('#summary-section-content').show();
                            self.$('.details-help-section').hide();
                            self.detailView = new SampleDetailsView({
                                el : '#summary-section-content',
                                model : model
                            }).render();
                            self.actionsView
                                .setActions(model.get('actions'))
                                .setPrimaryAction(model.getPrimaryAction())
                                .render()
                                .show();
                        }
                    });
                }
            },

            _onGridMultiSelect: function(samples) {
                var self = this;

                if (samples.length > 1) {
                    // reset the actions until the ajax call returns with the valid batch actions for the selected analyses
                    this.batchActionsView
                        .setActions(null)
                        .setPrimaryAction(null)
                        .render();

                    this.batchDetailView = new BatchSamplesDetailsView({
                        el: '#batch-summary-section-content',
                        collection: samples
                    }).render();

                    new BatchSpecimens(samples.models).getActions(function(actions) {
                        self.batchActionsView.renderActions(_.map(actions, function(anAction) {return 'BATCH_' + anAction;}));
                        self.$('#batch-summary-section').removeClass('hide');
                    });
                } else {
                    this._hideBatchActionsView();
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

            _onEdit: function(e, sample) {
                var sampleId = sample ? sample.get('id') : this.detailView.model.id;
                this._goToPage("sample/" + sampleId + "/edit");
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
            }

        });

        return SampleOverviewPageView;
    }
);