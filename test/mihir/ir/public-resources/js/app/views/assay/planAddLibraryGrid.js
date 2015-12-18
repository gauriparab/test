define(['views/common/grid/kendoGridView',
        'models/sample/library',
        'hb!templates/grid/grid-column-specimen-notes.html',
        'hb!templates/grid/grid-column-libraryGridName.html',
        'hb!templates/grid/grid-column-libraryGridType.html',
        'hb!templates/grid/grid-column-librarybarcode.html'
].concat('utils/templateFunctions'), 
	function(
		KendoGridView,
		Library,
		notesColumnTemplate,
		libraryNameTemplate,
		libraryTypeTemplate,
		libraryBarcodeTemplate){
	
	var Transport = kendo.Class.extend({

        _grid: null,

        init: function(grid) {
            this._grid = grid;
        },

        read: function(options) {
        	options.success([]);
        }
    });
	
	var PlanAddLibraryGrid = KendoGridView.extend({
		
		_model: Library,
		
		_transportCls: Transport,
		
        initialize: function() {
            KendoGridView.prototype.initialize.apply(this, arguments);
        },
        
        _pageable: false,
        
        _columns: function() {
        	var columns = [];
        	
        	var specimenIdColumn = this.cb()
	            .field('specimenId')
	            .sortable(false)
	            .title($.t('grid.column.specimenId'))
	            .build();
			
	        var libraryNameColumn = this.cb()
	            .title($.t('grid.column.libraryName'))
	            .template(libraryNameTemplate)
	            .build();
	        
	        var libraryTypeColumn = this.cb()
	            .title($.t('grid.column.libraryType'))
	            .template(libraryTypeTemplate)
	            .build();
			
	        var barcodeColumn = this.cb()
	            .title($.t('specimens.library.barcode.id'))
	            .template(libraryBarcodeTemplate)
	            .build();
	        
	        var libraryBatchIdColumn = this.cb()
	            .field('batchId')
	            .sortable(false)
	            .title($.t('grid.column.libraryBatchId'))
	            .build();
	
        	
			columns.push(specimenIdColumn);
			columns.push(libraryNameColumn);
			columns.push(barcodeColumn);
			columns.push(libraryTypeColumn);
			columns.push(libraryBatchIdColumn);
			
			return columns;
        }
	});
	
	return PlanAddLibraryGrid;
});