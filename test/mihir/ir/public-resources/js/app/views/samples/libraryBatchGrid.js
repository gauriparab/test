/*global define:false*/
define([
    'views/common/grid/kendoGridView',
    'models/sample/library',
    'hb!templates/grid/grid-library-action.html',
    'hb!templates/grid/grid-specimen-id.html',
    'hb!templates/grid/grid-column-libraryName.html',
    'hb!templates/grid/grid-column-libraryType.html',
    'hb!templates/grid/grid-column-inputQuantity.html',
    'hb!templates/grid/grid-column-libraryDetails.html',
    'hb!templates/grid/grid-column-librarybarcode.html'],

 function(KendoGridView,
         Library,
         actionTemplate,
         specimenIdTemplate,
         libraryNameTemplate,
         libraryTypeTemplate,
         libraryInputQuantityTemplate,
         libraryDetailsTemplate,
         libraryBarcodeTemplate) {

        'use strict';
        
        var Transport = kendo.Class.extend({

			_grid : null,

			/**
			 * Constructor
			 * 
			 * @param options
			 */
			init : function(grid) {
				this._grid = grid;
			},

			/**
			 * Method for fetching data
			 * 
			 * @param options
			 */
			read : function(options) {
				$.ajax({
					url : this._grid._url
							+ '?'
							+ $.param(_.extend({}, this
									._parameterMap(options.data),
									this._grid._filters)),
					type : 'POST',
					data : JSON.stringify(this._grid._filters),
					contentType : 'application/json',
					success : options.success,
					error : options.error
				});
			},

			/**
			 * Convert kendo grid parameters to spring parameters
			 * 
			 * @param options
			 * @returns {Object|*|Mixed}
			 * @private
			 */
			_parameterMap : function(options) {
				return _.reduce(options, function(memo, v, k) {
					switch (k) {
					case 'take':
						memo['page.size'] = v;
						break;
					case 'page':
						memo['page.page'] = v;
						break;
					case 'sort':
						_.each(v, function(sortObj) {
							memo['page.sort'] = sortObj.field;
							memo['page.sort.dir'] = sortObj.dir;
						});
						break;
					}
					return memo;
				}, {});
			}

		});


        /**
         * A re-usable sample grid view
         *
         * @type {*}
         */
        var libraryGridView = KendoGridView.extend({

            //_url: '/ir/secure/api/library/prepareLibraryBatch',

            _model: Library,
            
            _sortable: false,

            _pageable: false,
            
            initialize: function(options) {
                this.barcodes=options.barcodes;
                if(options.data.batchId) {
                	this._url= '/ir/secure/api/library/getEditBatchLibraryGrid';
                	this._filters = {batchId: options.data.batchId};
                } else {
                	this._url= '/ir/secure/api/library/prepareLibraryBatch';
                	this.selectedSpecimens=options.data;
                    var selectedSpecimenIds=[]
                    _.each(this.selectedSpecimens, function(specimen){
                    	selectedSpecimenIds.push(specimen.id);
                    });
                    this._filters = {selectedSpecimenIds: selectedSpecimenIds};
                }
                KendoGridView.prototype.initialize.apply(this, arguments);
            },
            
            _transportCls: Transport,
	
            _columns: function() {
            	var columns = [];
            	
				
                var specimenIdColumn = this.cb()
                    .field('specimenName')
                    .title($.t('grid.column.specimenId'))
                    //.template(specimenIdTemplate)
                    .sortable(false)
                    .build();
                
                var libraryTypeColumn = this.cb()
                	.field('libraryType')
                	.sortable(false)
	                .title($.t('grid.column.libraryType'))
	                //.template(libraryTypeTemplate)
	                .build();
					
                var libraryNameColumn = this.cb()
                    .title($.t('grid.column.libraryName'))
                    .sortable(false)
                    .template(libraryNameTemplate)
                    .build();
                
                var inputQuantityColumn = this.cb()
	    		    .title($.t('grid.column.inputQuantityUnit'))
	    		    .sortable(false)
	    		    .template(libraryInputQuantityTemplate)
	    		    .build();
                
				var self=this;
				var barcodeColumn = this.cb()
					.field('barcode')
					.sortable(false)
				    .title($.t('specimens.library.barcode.id'))
				    .template(libraryBarcodeTemplate.withFilter(function(ctx) {
	                    return _.extend(ctx, {
	                    	barcodes: self.barcodes
	                    });
	                }))
				    .build();
				
				columns.push(specimenIdColumn);
				columns.push(libraryTypeColumn);
				columns.push(libraryNameColumn);
				columns.push(barcodeColumn);
				columns.push(inputQuantityColumn);		

                return columns;
            },
            
            _onGridDataBound: function() {
            	
                this.trigger(Event.DATA_BOUND);
    		
                _.each(this.$el.find("div.dropdown"), function(div) {
                    $(div).parent().css("overflow", "visible");
                });

    		    $("[data-toggle='tooltip']").tooltip();   
    		    
    		    
    		    
                _.each(this._loadedPlugins, function(plugin) {
                    plugin.onGridDataBound();
                });
                
                var libCount=0;
                var list= this.$el.find('table tbody tr td:first-child');
                _.each(list, function(e) { 
            		if(e.innerHTML !== 'NA') {
            			libCount ++;
            		}
            	});
            	$("#totalLibraries").html(libCount);
            },

        });

        return libraryGridView;

    }
);
