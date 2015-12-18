/*global define:false*/
define([
    'views/common/grid/kendoGridView',
    'collections/sampleAttributes',
    'models/sample/library',
    'hb!templates/grid/grid-column-libraryGridName.html',
    'hb!templates/grid/grid-column-libraryGridType.html',
    'hb!templates/grid/grid-column-libraryDetails.html',
    'hb!templates/grid/grid-column-librarybarcode.html',
    'hb!templates/grid/grid-column-libraryBatchId.html',
    'hb!templates/grid/grid-column-libraryPrepId.html'
].concat(
    'utils/templateFunctions',
    'views/common/grid/plugins/rowSelectionGridPlugin',
    'views/common/grid/plugins/actionsGridPlugin',
    'views/common/grid/plugins/multiSelectionGridPlugin'),

 function(KendoGridView,
         SampleAttributes,
         Library,
         libraryNameTemplate,
         libraryTypeTemplate,
         libraryDetailsTemplate,
         libraryBarcodeTemplate,
         libraryBatchIdTemplate,
         libraryPrepIdTemplate) {

        'use strict';

        /**
         * A re-usable sample grid view
         *
         * @type {*}
         */
        var libraryGridView = KendoGridView.extend({

            _url: '/ir/secure/api/library',

            _model: Library,

            _sort: [{
                field: 'id',
                dir: 'desc'
            }],

            initialize: function(options) {
            	if(options.hasBatchId){
            		this._url = "/ir/secure/api/planrun/getLibrariesByBatchId";
            	}
                KendoGridView.prototype.initialize.apply(this, arguments);
                this.loadPlugin('actions');
                this.loadPlugin('rowSelection');
                this.loadPlugin('multiSelection');
            },
	
            _columns: function() {
            	var columns = [];
            	
                var libraryPrepIdColumn = this.cb()
                    .field('id')
                    .title($.t('grid.column.libraryPrepId'))
                    .width("125px")
                    .build();
                
                var libraryBatchIdColumn = this.cb()
	                .field('batchId')
	                .title($.t('grid.column.libraryBatchId'))
	                .build();
				
                var assayNameColumn = this.cb()
	                .field('assayName')
	                .title($.t('assay.name'))
	                .build();
                
                var specimenIdColumn = this.cb()
                    .field('specimenId')
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

                if(!this.options.hasBatchId){
                	columns.push(libraryBatchIdColumn);
					columns.push(assayNameColumn);
                }
				columns.push(specimenIdColumn);
				columns.push(libraryNameColumn);
				columns.push(libraryTypeColumn);
				columns.push(barcodeColumn);

                return columns;
            }

        });

        return libraryGridView;

    }
);
