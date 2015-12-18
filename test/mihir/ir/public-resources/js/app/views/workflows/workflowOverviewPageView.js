/* global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'views/workflows/workflowGridView',
    'views/workflows/workflowDetailsView',
    'views/common/searchView',
    'views/common/filterView',
    'views/common/actionsView',
    'views/common/confirmModalView',
    'views/workflow/confirmLockWorkflowModalView',
    'views/workflows/confirmDeleteWorkflowModalView',
    'views/common/bannersView',
    'collections/workflow/batchWorkflows',
    'views/workflows/batchWorkflowsDetailsView',
    'views/common/dialog',
    'models/batchresult/BatchResult',
    'hb!templates/workflow/workflow-overview-page.html',
    'hb!templates/common/versionFilter.html'
].concat(
    'views/common/grid/plugins/multiSelectionGridPlugin'),

    function(
        $,
        _,
        Backbone,
        WorkflowGridView,
        WorkflowDetailsView,
        SearchView,
        FilterView,
        ActionsView,
        Confirm,
        ConfirmLockWorkflow,
        ConfirmDeleteWorkflow,
        BannerView,
        BatchWorkflows,
        BatchWorkflowsDetailsView,
        Dialog,
        BatchResult,
        template,
        versionFilterTemplate) {

	'use strict';

    /**
     * Workflow overview page
     *
     * @type {*}
     */
    var WorkflowOverviewPageView = Backbone.View.extend({

        _template: template,
        _gridEl: '#viewworkflows-grid',
        _searchEl: '#query-form',
        _typeFilterEl: '#type-filters',
        _flagFilterEl: '#flag-filters',
        _techniqueFilterEl: '#technique-filters',
        _groupFilterEl: '#group-filters',
        _versionFilterEl: '#version-filters',
        _actionsEl: '#details-options-menu',
        _batchActionsEl: '#batch-details-options-menu',

        initialize: function(options) {
            options = options || {};

            this._savedWorkflowName = options.savedWorkflowName;
            this._saved = options.saved;
            this._canCreateWorkflow = options.canCreateWorkflow;

            this.gridView = new WorkflowGridView();
            if (options.canPerformBatchActions) {
                this.gridView.loadPlugin('multiSelection');
            }

            this.searchView = new SearchView();

            this.typeFilterView = new FilterView({
                url: '/ir/secure/api/v40/workflows/types',
                msgKeyPrefix: 'WorkflowApplicationType.',
                hasIcons: true,
                excludes: [
                    'TYPING'
                ],
                title: $.t('filter.application')
            });

            this.flagFilterView = new FilterView({
                filters: [
                    'Ion',
                    'Custom'
                ],
                title: $.t('filter.workflow')
            });

            this.techniqueFilterView = new FilterView({
                url: '/ir/secure/api/v40/workflows/techniques',
                title: $.t('filter.technology')
            });

            this.groupFilterView = new FilterView({
                url: '/ir/secure/api/v40/workflows/groupTypes',
                title: $.t('filter.group')
            });

            this.actionsView = new ActionsView({
                msgKeyPrefix: 'WorkflowAction.'
            });

            this.versionFilterView = new FilterView({
                url: '/ir/secure/api/v40/application/versions',
                title: $.t('filter.version'),
                template: versionFilterTemplate
            });

            this.batchActionsView = new ActionsView({
                msgKeyPrefix: 'WorkflowAction.'
            });
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);

            this.listenTo(this.gridView, 'rowSelect', this._onGridSelect);
            this.listenTo(this.gridView, 'multiSelect', this._onGridMultiSelect);
            this.listenTo(this.gridView, 'no-selection', this._showHelp);
            this.listenTo(this.gridView, 'action:edit', this._onEdit);
            this.listenTo(this.searchView, 'search', this._onSearch);
            this.listenTo(this.typeFilterView, 'filter', this._onTypeFilter);
            this.listenTo(this.flagFilterView, 'filter', this._onFlagFilter);
            this.listenTo(this.techniqueFilterView, 'filter', this._onTechniqueFilter);
            this.listenTo(this.versionFilterView, 'filter', this._onVersionFilter);
            this.listenTo(this.groupFilterView, 'filter', this._onGroupFilter);

            this.listenTo(this.actionsView, 'action:delete', this._onDelete);
            this.listenTo(this.actionsView, 'action:edit', this._onEdit);
            this.listenTo(this.actionsView, 'action:favorite', this._onFlag);
            this.listenTo(this.actionsView, 'action:unfavorite', this._onUnflag);
            this.listenTo(this.actionsView, 'action:lock', this._onLock);

            this.listenTo(this.batchActionsView, 'action:batch_delete', this._onBatchDelete);
        },

        undelegateEvents: function() {
            this.stopListening(this.batchActionsView);
            this.stopListening(this.actionsView);

            this.stopListening(this.groupFilterView, 'filter', this._onGroupFilter);
            this.stopListening(this.techniqueFilterView, 'filter', this._onTechniqueFilter);
            this.stopListening(this.versionFilterView, 'filter', this._onVersionFilter);
            this.stopListening(this.flagFilterView, 'filter', this._onFlagFilter);
            this.stopListening(this.typeFilterView, 'filter', this._onTypeFilter);
            this.stopListening(this.searchView, 'search', this._onSearch);
            this.stopListening(this.gridView, 'action:edit', this._onEdit);
            this.stopListening(this.gridView, 'multiSelect', this._onGridMultiSelect);
            this.stopListening(this.gridView, 'rowSelect', this._onGridSelect);
            this.stopListening(this.gridView, 'no-selection', this._showHelp);

            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
            this.$el.html(this._template({
                canCreateWorkflow: this._canCreateWorkflow
            }));
            this.searchView.setElement(this.$(this._searchEl)).render();
            this.typeFilterView.setElement(this.$(this._typeFilterEl)).render();
            this.flagFilterView.setElement(this.$(this._flagFilterEl)).render();
            this.techniqueFilterView.setElement(this.$(this._techniqueFilterEl)).render();
            this.versionFilterView.setElement(this.$(this._versionFilterEl)).render();
            this.groupFilterView.setElement(this.$(this._groupFilterEl)).render();
            this.gridView.setElement(this.$(this._gridEl)).render();
            this.actionsView.setElement(this.$(this._actionsEl));
            this.batchActionsView.setElement(this.$(this._batchActionsEl));

            $(".workflows").popover({
                trigger: "hover",
                placement: "left",
                html: true
            });

            if (this._savedWorkflowName) {
                if (this._saved) {
                    new BannerView({
                        id: 'save-success-banner',
                        container: $('.main-content>.container-fluid'),
                        style: 'success',
                        title: $.t('workflow.save.success', { workflowName: this._savedWorkflowName})
                    }).render();
                }
            }


            var summarySection = $(".summary-section");
            summarySection.affix({
                offset: {
                    top: summarySection.position().top
                }
            });
            summarySection.width(summarySection.width());
        },

        get: function(name) {
            return _.has(this, name) && this[name] || null;
        },

        _showHelp: function() {
            this.$('.details-help-section').show();
            this.$('#summary-section-content').hide();
            this.actionsView.hide();
        },

        _onGridSelect: function(model) {
            if (model) {
                if (this.detailView) {
                    this.detailView.destroy();
                    this.detailView = null;
                }

                this.$('.details-help-section').hide();
                this.$('#summary-section-content').show();

                this.detailView = new WorkflowDetailsView({
                    el: '#summary-section-content',
                    model: model
                });

                var self = this;
                model.fetch({
                    success: function(model) {
                        self.actionsView
                        .setActions(model.get('actions'))
                        .setPrimaryAction(model.getPrimaryAction())
                        .render()
                        .show();
                    }
                });
            }
        },

        _onGridMultiSelect: function(workflows) {
            var self = this;

            if (workflows.length > 1) {
                // reset the actions until the ajax call returns with the valid batch actions for the selected workflows
                this.batchActionsView
                    .setActions(null)
                    .setPrimaryAction(null)
                    .render();

                this.batchDetailView = new BatchWorkflowsDetailsView({
                    el: '#batch-summary-section-content',
                    collection: workflows
                }).render();

                new BatchWorkflows(workflows.models).getActions(function(actions) {
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

        _onTypeFilter: function(filter) {
            if (_.isEmpty(filter)) {
                this.gridView.clearFilter('type');
            } else {
                this.gridView.addFilter('type', filter);
            }
        },

        _onFlagFilter: function(filter) {
            if (_.isEmpty(filter)) {
                this.gridView.clearFilter('flag');
            } else {
                // 'favorite' field renamed to 'flagged' in UI ONLY
                if (filter === 'Flagged') {
                    filter = 'Favorite';
                }
                this.gridView.addFilter('flag', filter);
            }
        },

        _onTechniqueFilter: function(filter) {
            if (_.isEmpty(filter)) {
                this.gridView.clearFilter('technique');
            } else {
                this.gridView.addFilter('technique', filter);
            }
        },

        _onVersionFilter: function(filter) {
            if (_.isEmpty(filter)) {
                this.gridView.clearFilter('versionFilter');
            } else {
                this.gridView.addFilter('versionFilter', filter);
            }
        },

        _onGroupFilter: function(filter) {
            if (_.isEmpty(filter)) {
                this.gridView.clearFilter('group');
            } else {
                this.gridView.addFilter('group', filter);
            }
        },

        _getSelectedWorkflowModel: function() {
            return this.detailView && this.detailView.model;
        },

        _getSelectedWorkflowModelId: function() {
            return this.detailView && this.detailView.model && this.detailView.model.id;
        },

        _onDelete: function() {
            var workflow = this._getSelectedWorkflowModel();
            if (workflow) {
                Confirm.open(_.bind(this._deleteWorkflow, this, workflow), {}, ConfirmDeleteWorkflow);
            }
        },

        _deleteWorkflow: function(workflow) {
            var self = this,
                json = workflow.toJSON();
            workflow.destroy({
                url: '/ir/secure/api/v40/workflows/' + workflow.get('id'),
                success: function() {
                    new BannerView({
                        id: 'success-banner',
                        container: $('.main-content>.container-fluid'),
                        style: 'success',
                        title: $.t('workflow.delete.success', { workflow: json })
                    }).render();

                    self.actionsView.$el.hide();
                    self.detailView.destroy();
                    self.gridView.refresh();
                }
            });
        },

        _onBatchDelete: function() {
            var workflows = this.gridView.getSelected(),
                self = this,
                batch = new BatchWorkflows(workflows.models),
                totalWorkflows = batch.length;
            if (totalWorkflows) {
                Dialog.confirm(function() {
                    batch.destroy().done(function(response) {
                        var undeletedWorkflows = batch.length,
                            deletedWorkflows = totalWorkflows - undeletedWorkflows,
                            batchResult = new BatchResult(response);

                        if (deletedWorkflows) {
                            BannerView.show({
                                id: 'success-banner',
                                container: $('.main-content>.container-fluid'),
                                style: 'success',
                                title: $.t('batch.workflows.delete.response.success', {
                                    total: totalWorkflows,
                                    deleted: deletedWorkflows
                                })
                            });
                        }

                        if (undeletedWorkflows) {
                            BannerView.show({
                                id: 'error-banner',
                                container: $('.main-content>.container-fluid'),
                                style: 'error',
                                sticky: true,
                                title: $.t('batch.workflows.delete.response.error', {
                                    total: totalWorkflows,
                                    failed: undeletedWorkflows
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
                    bodyKey: 'batch.workflows.delete.confirm'
                });
            }
        },

        _onEdit: function(e, workflow) {
            var workflowId = workflow ? workflow.get('id') : this._getSelectedWorkflowModelId();
            if (workflowId) {
                window.location = "workflow/" + workflowId + "/edit";
            }
        },

        _onFlag: function() {
            var workflowId = this._getSelectedWorkflowModelId();
            if (workflowId) {
                window.location = "workflow/" + workflowId + "/favorite";
            }
        },

        _onUnflag: function() {
            var workflowId = this._getSelectedWorkflowModelId();
            if (workflowId) {
                window.location = "workflow/" + workflowId + "/unfavorite";
            }
        },

        _onLock: function() {
            var modelId = this._getSelectedWorkflowModelId();
            var modelName = this.detailView.model.get('name');
            var self = this;
            Confirm.open(function() {
                $.ajax({
                    url: '/ir/secure/api/v40/workflows/' + modelId + '/lock',
                    type: 'POST',
                    success : function() {
                        new BannerView({
                            id: 'lock-success-banner',
                            container: $('.main-content>.container-fluid'),
                            style: 'success',
                            title: $.t('workflow.lock.success', { workflowName: modelName})
                        }).render();
                        self.actionsView.$el.hide();
                        self.gridView.refresh();
                    }
                });
            }, {
                cancelClass: 'btn-primary',
                dialogName: 'confirm-workflow-lock'
            }, ConfirmLockWorkflow);
        }
    });

    return WorkflowOverviewPageView;
});