define(['views/common/grid/kendoGridView',
        'models/settings/logs',
	'hb!templates/grid/grid-column-log-name.html'].concat(
        	    'utils/templateFunctions',
        	    'views/common/grid/plugins/rowSelectionGridPlugin',
        	    'views/common/grid/plugins/actionsGridPlugin',
        	    'views/common/grid/plugins/multiSelectionGridPlugin'), 
	function(
			KendoGridView,
			LogsModel,
			template){
	
	var auditRecordsFridView = KendoGridView.extend({
		
		_url: '/ir/secure/api/settings/logs/getLogFiles',
		
		_model : LogsModel,
		
		 _pageSize: 10,
		
		_sort: [{
            field: 'createdOn',
            dir: 'desc'
        }],
                
        initialize: function(options) {
            KendoGridView.prototype.initialize.apply(this, arguments);
            this.loadPlugin('actions');
//            this.loadPlugin('rowSelection');
//            this.loadPlugin('multiSelection');
        },
        
        _columns: function() {
        	var columns = [];
        	
        	var auditUserColumn = this.cb()
        		.field('createdOn')
	            .title($.t('settings.logs.grid.createdOn'))
	            .build();
		
        	var auditActionPerformedColumn = this.cb()
        		.field('logFileName')
        		.sortable(true)
	            .title($.t('settings.logs.grid.fileName'))
	            .template(template)
	            .build();
			
        	var auditDataObjectColumn = this.cb()
        		.field('retainedUntil')
	            .title($.t('settings.logs.grid.retain'))
	            .build();

			columns.push(auditUserColumn);
			columns.push(auditActionPerformedColumn);
			columns.push(auditDataObjectColumn);
			
			return columns;
        }
	});
	
	return auditRecordsFridView;
});
