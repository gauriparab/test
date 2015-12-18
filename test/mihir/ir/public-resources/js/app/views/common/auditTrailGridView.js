/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'views/common/auditTrailDetailsView',
	'models/common/auditTrailModel'].concat(
    'utils/templateFunctions','views/common/grid/plugins/actionsGridPlugin'), 
    function($, _, kendo, KendoGridView, AuditTrailDetailsView, AuditTrailModel){

    	 'use strict';


	 var auditTrailGridView = KendoGridView.extend({

            //_url: '/ir/secure/api/auditmanagement/specimen',

            _model: AuditTrailModel,
	
	    _sort: [{
               field: 'timeStamp',
               dir: 'desc'
            }],

	    initialize: function(options) {
		this._url = options.gridViewUrl;
		this._filters = options.filters;
                KendoGridView.prototype.initialize.apply(this, arguments);
				this.loadPlugin('actions');
				//this.loadPlugin('multiSelection');
            },

	    _columns: function() {
				
            	var userColumn  = this.cb()
                    .field('user')
                    .title($.t('common.auditTrail.grid.column.user'))
					.sortable(false)
                    .build();

                var actionPerformedColumn  = this.cb()
                    .field('actionPerformed')
                    .title($.t('common.auditTrail.grid.column.actionPerformed'))
					.sortable(false)
                    .build();

                var dataObjectNameColumn = this.cb()
                    .field('dataObjectName')
                    .title($.t('common.auditTrail.grid.column.dataObjectName'))
					.sortable(false)
                    .build();
         	
		 var timestampColumn = this.cb()
                    .field('timeStamp')
                    .title($.t('common.auditTrail.grid.column.timestamp'))
                    .template('#= (timeStamp != null) ? kendo.toString(new Date(Date.parse(timeStamp)),"yyyy-MM-dd HH:mm") : "" #')
                    .width('18%')
					.sortable(false)
                    .build();

                var recordColumn = this.cb()
                	.field('revId')
                    .title($.t('common.auditTrail.grid.column.record'))
					.template('<a href="javascript:void(0)" title="'+$.t('common.auditTrail.grid.column.auditTrailDetails')+'" data-action="view_details"><img src="/ir/resources/img/record.png"/></a>')
					.sortable(false)
                    .build();

		 return [
                    userColumn,
		    actionPerformedColumn,
		    dataObjectNameColumn,
		    timestampColumn,
                    recordColumn
                ];
            }

        });

        return auditTrailGridView;
});
