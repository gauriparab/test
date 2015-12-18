/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'models/analysis/analysisModel',
    'collections/BaseCollection',
    'views/common/grid/kendoGridView',
    'views/common/baseModalView',
    'views/analysis/analysisErrorLogFileModalView',
    'hb!templates/grid/grid-column-name.html',
    'hb!templates/grid/analysis/grid-column-ok.html',
    'hb!templates/grid/analysis/grid-column-status.html',
    'hb!templates/grid/analysis/grid-column-stage.html',
    'hb!templates/grid/analysis/grid-column-workflow.html',
    'hb!templates/grid/grid-column-shared.html',
    'hb!templates/grid/grid-column-checkbox.html',
    'hb!templates/grid/grid-column-date.html',
    'hb!templates/grid/grid-column-icon-header.html'
].concat([
    'views/common/grid/plugins/multiSelectionGridPlugin',
    'views/common/grid/plugins/actionsGridPlugin',
    'views/common/grid/plugins/rowSelectionGridPlugin',
    'utils/templateFunctions'
]), function(
    $,
    _,
    kendo,
    Analysis,
    BaseCollection,
    KendoGridView,
    BaseModalView,
    AnalysisErrorLogFileModalView,
    gridColumnNameTemplate,
    gridColumnOkTemplate,
    gridColumnStatusTemplate,
    gridColumnStageTemplate,
    gridColumnWorkflowTemplate,
    gridColumnSharedTemplate,
    checkboxColumnTemplate,
    gridColumnDateTemplate,
    gridIconHeaderTemplate) {

    'use strict';

    /**
     * A re-usable analysis grid view
     *
     * @type {*}
     */
    var AnalysisGridView = KendoGridView.extend({

        _url: '/ir/secure/api/v40/analysis',

        _model: Analysis,

        _fields: {
            shared: {
                type: 'boolean'
            },
            name: {
                type: 'string'
            },
            stage: {
                type: 'string'
            },
            status: {
                type: 'string'
            }
        },

        _sort: [{
            field : 'createdOn',
            dir : 'desc'
        }],

        events: {
            'click .open-error-log-modal': '_onOpenErrorLog'
        },

        initialize: function(opts) {
            KendoGridView.prototype.initialize.apply(this, arguments);

            var options = opts || {};
            this.eventDispatcher = options.actionsEventSource || this;
            this.loadPlugin('actions');
            this.loadPlugin('rowSelection');
            if (options.canPerformBatchActions) {
                this.loadPlugin('multiSelection');
            }
        },

        _columns: function() {
            var checkedOutColumn = this.cb()
                .field('checkedOutBy.lastName')
                .width('4%')
                .headerTemplate(gridIconHeaderTemplate({icon: 'icon-ok', title: 'Analysis is being edited'}))
                .template(gridColumnOkTemplate)
                .build();

            var sharedColumn = this.cb()
                .field('shared')
                .sortable(false)
                .width('4%')
                .headerTemplate(gridIconHeaderTemplate({icon: 'icon-user', title: 'Analysis has been shared with you'}))
                .template(gridColumnSharedTemplate)
                .build();

            var nameColumn = this.cb()
                .field('name')
                .title('Analysis')
                .template(gridColumnNameTemplate.withFilter(function(ctx) {
                    return _.extend(ctx, {
                        primaryAction: new Analysis(ctx.toJSON()).getPrimaryAction()
                    });
                }))
                .attributes({
                    'class': 'vertical-align-top'
                })
                .build();

            var stageColumn = this.cb()
                .field('stage')
                .title('Stage')
                .width('14%')
                .template(gridColumnStageTemplate)
                .attributes({
                    'class': 'vertical-align-top'
                })
                .build();

            var workflowColumn = this.cb()
                .field('workflow.name')
                .title('Workflow')
                .template(gridColumnWorkflowTemplate)
                .attributes({
                    'class': 'vertical-align-top'
                })
                .build();

            var createdOnColumn = this.cb()
                .field('createdOn')
                .title('Created On')
                .width('16%')
                .template(gridColumnDateTemplate.forField('createdOn'))
                .attributes({
                    'class': 'vertical-align-top'
                })
                .build();

            var statusColumn = this.cb()
                .field('status')
                .title('Status')
                .width('14%')
                .template(gridColumnStatusTemplate)
                .attributes({
                    'class': 'vertical-align-top'
                })
                .build();

            var versionColumn = this.cb()
                .field('applicationVersion.name')
                .title('Version')
                .width('7%')
                .attributes({
                    'class': 'vertical-align-top'
                })
                .build();

            return [
                checkedOutColumn,
                sharedColumn,
                nameColumn,
                versionColumn,
                stageColumn,
                workflowColumn,
                createdOnColumn,
                statusColumn
            ];
        },

        _onOpenErrorLog: function(e) {
            var analysisId = $(e.currentTarget).attr('data-id');
            BaseModalView.open($.noop, {id : analysisId}, AnalysisErrorLogFileModalView);
        }

    });

    return AnalysisGridView;

});
