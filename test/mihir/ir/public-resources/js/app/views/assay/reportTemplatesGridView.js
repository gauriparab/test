/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/reportTemplateModel',
    'hb!templates/grid/grid-column-report-notes.html',
    'hb!templates/grid/grid-report-template-actions.html'

].concat(
    'utils/templateFunctions',
    'views/common/grid/plugins/actionsGridPlugin'),

    function($,
             _,
             kendo,
             KendoGridView,
             ReportTemplateModel,
             noteTemplate,
             actionTemplate){

        'use strict';

        var ReportTemplateGridView = KendoGridView.extend({

            _url: '/ir/secure/api/rdxReportTemplate/getAllReportTemplates',

            _model: ReportTemplateModel,
            
            _sort: [{
                field: 'createdOn',
                dir: 'desc'
            }],

            initialize: function(options) {
                KendoGridView.prototype.initialize.apply(this, arguments);
                this.loadPlugin('actions');
            },

            _columns: function() {

            	var columns = [];

                var nameColumn = this.cb()
                    .field('name')
                    .title($.t('grid.header.label.name'))
                    .template('<a href="javascript:void(0)" data-action="view_details">#= (name) ? name : "" #</a>')
                    .width('20%')
                    .build();

                var assayColuumn = this.cb()
                    .field('assayName')
                    .title($.t('assay.name'))
                    .width('20%')
                    .build();

                var stateColumn =  this.cb()
                	.field('state')
                	.title($.t('grid.column.status'))
                	.build();

                var createdByColumn = this.cb()
                    .field('createdBy')
                    .title($.t('grid.header.label.createdBy'))
                    .build();

                var createdOnColumn = this.cb()
                    .field('createdOn')
                    .title($.t('grid.header.label.createdOn'))
                    .template('#= (createdOn != null) ? createdOn : "" #')
                    .build();

                var notesColumn = this.cb()
                 	 .field('note')
                	.title($.t('report.template.addNote'))
                	.template(noteTemplate)
                	.build();

                var actionsColumn = this.cb()
	                .title($.t('grid.column.action'))
	                .sortable(false)
	                .template(actionTemplate)
	                .build();

				columns.push(nameColumn);
        columns.push(assayColuumn);
				columns.push(stateColumn);
				columns.push(createdByColumn);
				columns.push(createdOnColumn);
				columns.push(notesColumn);
				columns.push(actionsColumn);

		        return columns;
            }

        });

        return ReportTemplateGridView;

    }
);
