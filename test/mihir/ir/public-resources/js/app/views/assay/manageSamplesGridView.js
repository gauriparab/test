/*global define:false*/
define(
		[ 'jquery', 'underscore', 'kendo', 'views/common/grid/kendoGridView',
				'models/sample/sampleModel',
				'hb!templates/grid/grid-sample-actions.html',
				'hb!templates/grid/grid-sample-libraryKit.html',
				'hb!templates/grid/grid-sample-description.html' ]
				.concat('views/common/grid/plugins/multiSelectionGridPlugin', 'utils/templateFunctions'),

		function($, _, kendo, KendoGridView, Sample, actionTemplate,
				libKitTemplate, descriptionTemplate) {

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
			var manageSamplesGridView = KendoGridView.extend({
						
						_url : '/ir/secure/api/samplemanagement/samples',

						_model : Sample,

						_sort : [ {
							field : 'createdDate',
							dir : 'desc'
						} ],

						initialize : function(options) {
							KendoGridView.prototype.initialize.apply(this,
									arguments);
							this.loadPlugin('multiSelection');
						},

						_transportCls : Transport,

						_columns : function() {

							var columns = [];

							var idColumn = this.cb().field('sampleId').title(
									$.t('manage.sample.id')).build();

							var nameColumn = this.cb().field('sampleName')
									.title($.t('manage.sample.name')).build();

							var barcodeColumn = this
									.cb()
									.field('barcode')
									.title($.t('manage.sample.barcode'))
									.template('#= (barcode != null) ? barcode.idStr: "" #')
									.build();

							var createdByColumn = this.cb().field('createdBy')
									.title($.t('grid.column.createdBy'))
									.build();

							var descriptionColumn = this.cb().field('description').title(
									$.t('manage.sample.description')).template(
									descriptionTemplate).build();

							columns.push(idColumn);
							columns.push(nameColumn);
							columns.push(barcodeColumn);
							columns.push(createdByColumn);
							columns.push(descriptionColumn);						

							return columns;
						}

					});

			return manageSamplesGridView;

		});
