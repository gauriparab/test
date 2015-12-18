/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'hb!templates/grid/grid-column-locked.html',
    'hb!templates/grid/grid-column-provided.html',
    'hb!templates/grid/grid-column-name.html',
    'hb!templates/grid/grid-column-date.html',
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
    lockedColumnTemplate,
    providedColumnTemplate,
    gridColumnNameTemplate,
    dateColumnTemplate,
    iconHeaderTemplate
) {
    'use strict';

    /**
     * A re-usable presets grid view
     *
     * @type {*}
     */
    var PresetsGridView = KendoGridView.extend({

        _fields: {
            name: {
                type: 'string'
            },
            description: {
                type: 'string'
            },
            factoryProvided: {
                type: 'boolean'
            },
            createdOn: {
                type: 'date'
            },
            status: {
                type: 'string'
            }
        },

        _sort: [{
            field: 'createdOn',
            dir: 'desc'
        }],

        initialize: function() {
            KendoGridView.prototype.initialize.apply(this, arguments);
            this.loadPlugin('rowSelection');
            this.loadPlugin('actions');
        },

        _statusColumn: function() {
            return {
                field: 'status',
                sortable: true,
                width: '45px',
                headerTemplate: iconHeaderTemplate({icon: 'icon-lock', title: 'Preset is locked'}),
                template: lockedColumnTemplate
            };
        },

        _factoryProvidedColumn: function() {
            return {
                field: 'factoryProvided',
                width: '100px',
                headerTemplate: iconHeaderTemplate({icon: 'ion-default', title: 'Ion Default preset'}),
                sortable: true,
                template: providedColumnTemplate
            };
        },

        _nameColumn: function(Model) {
            return {
                field: 'name',
                title: 'Name',
                sortable: true,
                template: gridColumnNameTemplate.withFilter(function(ctx) {
                    return Model && _.isFunction(Model.prototype.getPrimaryAction) && _.extend(ctx, {
                        primaryAction: new Model(ctx.toJSON()).getPrimaryAction()
                    }) || ctx;
                })
            };
        },

        _applicationVersionColumn: function() {
            return {
                field: 'applicationVersion',
                title: 'Version',
                sortable: true,
                template: '#=  (applicationVersion == null) ? "" : applicationVersion.name #'
            };
        },

        _createdByColumn: function() {
            return {
                field: 'createdBy',
                title: 'Created By',
                width: '185px',
                sortable: true,
                template: '#= (createdBy == null) ? "" : createdBy.lastName + ", " + createdBy.firstName#'
            };
        },

        _createdOnColumn: function() {
            return {
                field: 'createdOn',
                title: 'Created On',
                width: '185px',
                sortable: true,
                template: dateColumnTemplate.forField('createdOn')
            };
        },

        _columns: function() {
            return [
                this._statusColumn(),
                this._factoryProvidedColumn(),
                this._nameColumn(this._model),
                this._applicationVersionColumn(),
                this._createdByColumn(),
                this._createdOnColumn()
            ];
        }

    });

    return PresetsGridView;
});
