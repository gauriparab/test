/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/kendoGridView',
    'models/specimen',
    'models/sample/attribute',
    'hb!templates/grid/grid-column-analyzed.html',
    'hb!templates/grid/grid-column-flagged.html',
    'hb!templates/grid/grid-column-checkbox.html',
    'hb!templates/grid/grid-column-user.html',
    'hb!templates/grid/grid-column-date.html',
    'hb!templates/grid/grid-column-message.html'
].concat('utils/templateFunctions'),

    function(
        $,
        _,
        kendo,
        KendoGridView,
        Sample,
        Attribute,
        analyzedColumnTemplate,
        flaggedColumnTemplate,
        checkBoxColumnTemplate,
        userColumnTemplate,
        dateColumnTemplate,
        messageColumnTemplate) {

        'use strict';

        /**
         * A re-usable sample grid view
         *
         * @type {*}
         */
        var SampleGridView = KendoGridView.extend({

            _excludedAttributes: ['File Path', 'Gender', 'Sample Name'],

            url: '/ir/secure/api/v40/samples',

            model: Sample,

            fields: {
                analyzed : {
                    type : 'boolean'
                },
                flagged : {
                    type : 'boolean'
                },
                name : {
                    type : 'string'
                },
                createdOn : {
                    type : 'string'
                }, 
                attributeValueMap : {
                    type : 'object'
                },
                metadata : {
                    type : 'object'
                }
            },

            sort: [{
                field : 'createdOn',
                dir   : 'desc'
            }],

            events: {
                "click tbody > tr": "_onRowClicked",
                "click tbody > tr input[type=checkbox]" : "_onCheckboxClicked",
                "click thead [value=all]:checkbox": "_onAllClicked"
            },

            onGridDataBound: function() {
                KendoGridView.prototype.onGridDataBound.apply(this, arguments);
                this._clearSelectAllControl();
            },

            _columns: function() {
                return [{
                    headerTemplate: checkBoxColumnTemplate({}),
                    template : checkBoxColumnTemplate
                }, {
                    field : 'flagged',
                    width : '40px',
                    sortable : true,
                    headerTemplate : this.getIconHeader({icon: 'icon-flag', title: 'Sample is flagged'}),
                    template : flaggedColumnTemplate,
                    hidden: true
                }, {
                    field : 'analyzed',
                    width : '40px',
                    sortable : true,
                    headerTemplate : this.getIconHeader({icon: 'icon-eye-open', title: 'Sample has been analyzed'}),
                    template : analyzedColumnTemplate
                }, {
                    field : 'name',
                    title : 'Sample',
                    sortable : true
                }, {
                    title : $.t(Attribute.Name.GENDER),
                    sortable : false,
                    template: messageColumnTemplate.forField('gender').forModel(Sample)
                }, {
                    title: $.t(Attribute.Name.TYPE),
                    sortable: false,
                    template: messageColumnTemplate.forField('type').forModel(Sample)
                }, {
                    field : 'metadata.Role',
                    title : 'Role',
                    // <!-- sorting is not working yet, requires changes to the
                    // controller... -->
                    // <!-- But header in table looks very ugly that way... -->
                    sortable : false,
                    template : '#= (metadata && metadata.hasOwnProperty("Role") && metadata.Role) ? (metadata.Role).toLowerCase() : "Unknown" #'
                }, {
                    field : 'createdBy',
                    title : 'Imported By',
                    sortable : true,
                    template : userColumnTemplate.forField('createdBy')
                }, {
                    field : 'createdOn',
                    title : 'Imported On',
                    sortable : true,
                    template : dateColumnTemplate.forField('createdOn')
                }];
            },

            /**
             * Override the default.
             */
            onGridSelectionChange: function() {
            },

            markRowAsSelected: function(row) {
                $(row).addClass('active').find(':checkbox').prop('checked', true);
            },

            markRowAsUnselected: function(row) {
                $(row).removeClass('k-state-selected active').find(':checkbox').prop('checked', false);
                this._clearSelectAllControl();
            },

            _onRowClicked : function(e) {
                var row = $(e.currentTarget).closest('tr'),
                    isChecked = row.find('input[type=checkbox]').is(':checked');
                e.preventDefault();
                // when the row is clicked the checkbox input is not checked yet  so I am sending
                // the future checkbox status
                this._onRowSelection(row, !isChecked);
            },
            
            _onAllClicked: function(e) {
                e.stopPropagation();
                var self = this,
                    isChecked = $(e.currentTarget).is(':checked');
                this.$('tbody :checkbox').closest('tr').each(function(i, tr) {
                    $(tr).find(':checkbox').prop('checked', isChecked);
                    self._onRowSelection(tr, isChecked);

                });
            },
            
            _onCheckboxClicked: function(e) {
                var row = $(e.currentTarget).closest('tr'),
                    isChecked = row.find('input[type=checkbox]').is(':checked');
                e.stopPropagation();
                // when the checkbox is clicked the checkbox input is already checked  so I am sending
                // the current checkbox status
                this._onRowSelection(row, isChecked);
            },

            _onRowSelection: function(row, selectFlag) {
                if (selectFlag) {
                    this.selectRow(row);
                } else {
                    this.unselectRow(row);
                }
            },

            _clearSelectAllControl: function() {
                this.$('input[type=checkbox][value=all]').prop('checked', false);
            },

            clearSelection : function() {
                this.clearGridSelection({silent: true});
            }
        });

        return SampleGridView;

    }
);
