/*global define:false*/
define([ 'views/common/grid/kendoGridView',
		'models/sample/library',
		'hb!templates/grid/grid-column-specimen-notes.html',
        'hb!templates/grid/grid-column-libraryGridName.html',
        'hb!templates/grid/grid-column-libraryGridType.html',
        'hb!templates/grid/grid-column-librarybarcode.html'].concat('utils/templateFunctions'),
	function(KendoGridView, 
			Library,
			notesColumnTemplate,
			libraryNameTemplate,
			libraryTypeTemplate,
			libraryBarcodeTemplate) {

			'use strict';

			var Transport = kendo.Class.extend({

				_grid : null,

				init : function(grid) {
					this._grid = grid;
				},

				read : function(options) {
					$.ajax({
						url : this._grid._url + '?'
								+ $.param(_.extend({}, this._grid._filters)),
						type : 'GET',
						contentType : 'application/json',
						success : options.success,
						error : options.error
					});
				},

			});

			var planReviewLibraryGridView = KendoGridView.extend({

				_url : '/ir/secure/api/planrun/getReviewLibrariesByAssay',

				_model : Library,

				_sort : [ {
					field : 'specimenId',
					dir : 'desc'
				} ],

				initialize : function(options) {
					this._filters = {
						expId : options.planId,
						assayId : options.assayId
					};
					KendoGridView.prototype.initialize.apply(this, arguments);
					this.loadPlugin('actions');

					_.extend(this, _.defaults(options || {}, {
						nameHasAction : true
					}));
				},

				_pageable : false,

				_transportCls : Transport,

				_columns : function() {

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
					        	
					columns.push(specimenIdColumn);
					columns.push(libraryNameColumn);
					columns.push(barcodeColumn);
					columns.push(libraryTypeColumn);
					
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
		            
		            var checkboxes= this.$el.find('table tbody tr td:first-child :checkbox');
		            var specIds= this.$el.find('table tbody tr td:nth-child(2)');
	            	for(var i=0; i<checkboxes.length ; i++) {
	            		if(specIds[i].textContent=='NA')
	            			checkboxes[i].disabled=true;
	            	}
		        },

			});

			return planReviewLibraryGridView;
		});
