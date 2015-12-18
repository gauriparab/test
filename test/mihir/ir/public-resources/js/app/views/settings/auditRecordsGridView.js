define(['views/common/grid/kendoGridView',
        'models/baseModel'].concat(
        	    'utils/templateFunctions',
        	    'views/common/grid/plugins/actionsGridPlugin',
        	    'views/common/grid/plugins/multiSelectionGridPlugin'), 
	function(
			KendoGridView,
			BaseModel){
	
	var auditRecordsFridView = KendoGridView.extend({
		
		_url: '/ir/secure/api/audit/generic/search',
		
		_model : BaseModel,
		
		 _pageSize: 10,
		
		_sort: [{
            field: 'timestamp',
            dir: 'desc'
        }],
                
        initialize: function() {
            KendoGridView.prototype.initialize.apply(this, arguments);
            this.loadPlugin('actions');
            this.loadPlugin('multiSelection');
        },
        
        _columns: function() {
        	var columns = [];
        	
        	var auditUserColumn = this.cb()
        		.field('user')
	            .title($.t('common.auditTrail.grid.column.user'))
	            .build();
		
        	var auditActionPerformedColumn = this.cb()
        		.field('actionPerformed')
	            .title($.t('common.auditTrail.grid.column.actionPerformed'))
	            .build();
			
        	var auditDataObjectColumn = this.cb()
        		.field('dataObjectName')
	            .title($.t('common.auditTrail.grid.column.dataObjectName'))
	            .build();
		
        	var auditTimestampColumn = this.cb()
	            .field('timeStamp')
	            .sortable(true)
	            .title($.t('common.auditTrail.grid.column.timestamp'))
	            .build();

        	var auditRecordColumn = this.cb()
        		.field('revId')
        		.sortable(false)
	            .title($.t('common.auditTrail.grid.column.record'))
	            .template('<a href="javascript:void(0)" title="'+ $.t('common.auditTrail.grid.column.auditTrailDetails') +'" data-action="audit_view_details"><img src="/ir/resources/img/record.png"/></a>')
	            .build();
        	
			columns.push(auditUserColumn);
			columns.push(auditActionPerformedColumn);
			columns.push(auditDataObjectColumn);
			columns.push(auditTimestampColumn);
			columns.push(auditRecordColumn);
			
			return columns;
        }
	});
	
	return auditRecordsFridView;
});