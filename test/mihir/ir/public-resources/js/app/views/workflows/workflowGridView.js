/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/workflow/workflowModel',
    'hb!templates/grid/grid-column-workflow-flagged.html',
    'hb!templates/grid/grid-column-locked.html',
    'hb!templates/grid/grid-column-provided.html',
    'hb!templates/grid/grid-column-name.html',
    'hb!templates/grid/workflow/grid-column-application-type.html',
    'hb!templates/grid/grid-column-icon-header.html'
].concat(
    'utils/templateFunctions',
    'views/common/grid/plugins/rowSelectionGridPlugin',
    'views/common/grid/plugins/actionsGridPlugin'
), function(
    $,
    _,
    kendo,
    KendoGridView,
    Workflow,
    flaggedColumnTemplate,
    lockedColumnTemplate,
    providedColumnTemplate,
    nameColumnTemplate,
    applicationTypeColumnTemplate,
    iconHeaderTemplate) {

    'use strict';

    /**
     * A re-usable workflow grid view
     *
     * @type {*}
     */
    var WorkflowGridView = KendoGridView.extend({

        _url: '/ir/secure/api/v40/workflows',

        _model: Workflow,

        _fields: {
            favorite : {
                type : 'boolean'
            },
            status : {
                type : 'string'
            },
            applicationType : {
                type : 'string'
            },
            name : {
                type : 'string'
            },
            factoryProvided : {
                type : 'boolean'
            }
        },

        _sort: [{
            field : 'createdOn',
            dir : 'desc'
        }],

        initialize: function(options) {
            KendoGridView.prototype.initialize.apply(this, arguments);

            this.loadPlugin('rowSelection');
            this.loadPlugin('actions');

            _.extend(this, _.defaults(options || {}, {
                nameHasAction: true
            }));
        },

        _columns: function() {
            var fieldColumn = this.cb()
                .field('favorite')
                .width('4%')
                .sortable(false)
                .headerTemplate(iconHeaderTemplate({icon: 'icon-flag', title: 'Workflow is flagged'}))
                .template(flaggedColumnTemplate)
                .hidden(true) // TODO: Unhide when SL implements flagging
                .build();

            var statusColumn = this.cb()
                .field('status')
                .width('4%')
                .headerTemplate(iconHeaderTemplate({icon: 'icon-lock', title: 'Workflow is locked'}))
                .template(lockedColumnTemplate)
                .build();

            var providedColumn = this.cb()
                .field('factoryProvided')
                .width('8%')
                .headerTemplate(iconHeaderTemplate({icon: 'ion-default', title: 'Ion Default workflow'}))
                .template(providedColumnTemplate)
                .build();

            var applicationTypeColumn = this.cb()
                .field('applicationType')
                .width('15%')
                .title('Application')
                .template(applicationTypeColumnTemplate)
                .build();

            var nameColumn = this.cb()
                .field('name')
                .title('Workflow Name')
                .attributes({
                    'class': 'vertical-align-top'
                }).template(nameColumnTemplate.withFilter(function(ctx) {
                    return _.extend(ctx, {
                        primaryAction: new Workflow(ctx.toJSON()).getPrimaryAction()
                    });
                }))
                .build();

            var groupingTypeColumn = this.cb()
                .field('groupingType')
                .width('15%')
                .title('Sample Group')
                .template('#= $.t(data.groupingType) #')
                .attributes({
                    'class': 'vertical-align-top'
                })
                .build();

            var createdOnColumn = this.cb()
                .field('createdOn')
                .width('17%')
                .title('Created On')
                .template('#= (createdOn != null) ? kendo.toString(new Date(Date.parse(createdOn)),"MMM dd yyyy hh:mm tt") : "" #')
                .attributes({
                    'class': 'vertical-align-top'
                })
                .build();

            var applicationVersionColumn = this.cb()
                .field('applicationVersion')
                .title('Version')
                .template('#= (applicationVersion != null) ? applicationVersion.name : "" #')
                .build();

            if (this.nameHasAction) {
                nameColumn = this.cb()
                    .field('name')
                    .title('Workflow Name')
                    .template(nameColumnTemplate.withFilter(function(ctx) {
                        return _.extend(ctx, {
                            primaryAction: new Workflow(ctx.toJSON()).getPrimaryAction()
                        });
                    }))
                    .attributes({
                        'class': 'vertical-align-top'
                    })
                    .build();
            }

            return [
                fieldColumn,
                statusColumn,
                providedColumn,
                applicationTypeColumn,
                nameColumn,
                applicationVersionColumn,
                groupingTypeColumn,
                createdOnColumn
            ];
        }

    });

    return WorkflowGridView;

});
