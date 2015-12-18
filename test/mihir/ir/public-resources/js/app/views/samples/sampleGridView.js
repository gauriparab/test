/*global define:false*/
define([
    'jquery',
    'underscore',
    'views/common/grid/kendoGridView',
    'models/specimen',
    'models/sample/attribute',
    'hb!templates/grid/grid-column-analyzed.html',
    'hb!templates/grid/grid-column-flagged.html',
    'hb!templates/grid/grid-column-locked.html',
    'hb!templates/grid/grid-column-name.html',
    'hb!templates/grid/grid-column-user.html',
    'hb!templates/grid/grid-column-date.html',
    'hb!templates/grid/grid-column-icon-header.html',
    'hb!templates/grid/grid-column-message.html'
].concat(
    'utils/templateFunctions',
    'views/common/grid/plugins/rowSelectionGridPlugin',
    'views/common/grid/plugins/actionsGridPlugin',
    'views/common/grid/plugins/multiSelectionGridPlugin'),

    function($,
             _,
             KendoGridView,
             Sample,
             Attribute,
             analyzedColumnTemplate,
             flaggedColumnTemplate,
             lockedColumnTemplate,
             gridColumnNameTemplate,
             gridColumnUserTemplate,
             gridColumnDateTemplate,
             gridIconHeaderTemplate,
             gridColumnMessageTemplate) {

        'use strict';

        /**
         * A re-usable sample grid view
         *
         * @type {*}
         */
        var SampleGridView = KendoGridView.extend({

            _excludedAttributes: ['File Path', 'Gender', 'Sample Name'],

            _url: '/ir/secure/api/v40/samples',

            _model: Sample,

            _fields: {
                analyzed: {
                    type: 'boolean'
                },
                flagged: {
                    type: 'boolean'
                },
                name: {
                    type: 'string'
                },
                createdOn: {
                    type: 'string'
                },
                attributeValueMap : {
                    type : 'object'
                },
                metadata : {
                    type : 'object'
                }
            },

            _sort: [{
                field: 'createdOn',
                dir: 'desc'
            }],

            initialize: function(options) {
                KendoGridView.prototype.initialize.apply(this, arguments);
                this.loadPlugin('actions');
                this.loadPlugin('rowSelection');
                if (options.canPerformBatchActions) {
                    this.loadPlugin('multiSelection');
                }
            },

            _columns: function() {
                var flaggedColumn = this.cb()
                    .field('flagged')
                    .width('4%')
                    .sortable(false)
                    .headerTemplate(gridIconHeaderTemplate({
                        icon: 'icon-flag',
                        title: 'Sample is flagged'
                    }))
                    .template(flaggedColumnTemplate)
                    .hidden(true)
                    .build();

                var analyzedColumn = this.cb()
                    .field('analyzed')
                    .width('4%')
                    .headerTemplate(gridIconHeaderTemplate({
                        icon: 'icon-eye-open',
                        title: 'Sample has been analyzed'
                    }))
                    .template(analyzedColumnTemplate)
                    .build();

                var statusColumn = this.cb()
                    .field('status')
                    .width('4%')
                    .headerTemplate(gridIconHeaderTemplate({
                        icon: 'icon-lock',
                        title: 'Sample is locked'
                    }))
                    .template(lockedColumnTemplate)
                    .build();

                var nameColumn = this.cb()
                    .field('name')
                    .title('Sample')
                    .template(gridColumnNameTemplate.withFilter(function(ctx) {
                        return _.extend(ctx, {
                            primaryAction: new Sample(ctx.toJSON()).getPrimaryAction()
                        });
                    }))
                    .build();

                var genderColumn = this.cb()
                    .title($.t(Attribute.Name.GENDER))
                    .sortable(false)
                    .template(gridColumnMessageTemplate.forField('gender').forModel(Sample))
                    .build();

                var roleColumn = this.cb()
                    .field('metadata.Role')
                    .title('Role')
                    .sortable(false)
                    .template('#= (metadata && metadata.hasOwnProperty("Role") && metadata.Role) ? (metadata.Role).toLowerCase() : "Unknown" #')
                    .build();

                var createdByColumn = this.cb()
                    .field('createdBy')
                    .title('Imported By')
                    .width('15%')
                    .template(gridColumnUserTemplate.forField('createdBy'))
                    .build();

                var createdOnColumn = this.cb()
                    .field('createdOn')
                    .title('Imported On')
                    .width('18%')
                    .template(gridColumnDateTemplate.forField('createdOn'))
                    .build();

                return [
                    flaggedColumn,
                    analyzedColumn,
                    statusColumn,
                    nameColumn,
                    genderColumn,
                    roleColumn,
                    createdByColumn,
                    createdOnColumn
                ];
            }

        });

        return SampleGridView;

    }
);
