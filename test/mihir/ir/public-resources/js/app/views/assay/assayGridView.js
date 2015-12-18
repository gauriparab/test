/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/assay/assayModel',
    'views/common/bannersView',
    'hb!templates/grid/grid-column-factory.html',
    'hb!templates/grid/grid-column-iuo.html',
    'hb!templates/grid/grid-column-locked.html',
    'hb!templates/grid/grid-actions.html',
    'hb!templates/grid/grid-column-icon-header.html',
    'hb!templates/grid/grid-column-assayName.html',
    'hb!templates/grid/grid-column-assayPanel.html',
    'hb!templates/grid/grid-column-assayFusionPanel.html'
].concat(
    'utils/templateFunctions',
    //'views/common/grid/plugins/rowSelectionGridPlugin',
    'views/common/grid/plugins/actionsGridPlugin'
), function(
    $,
    _,
    kendo,
    KendoGridView,
    Model,
    BannerView,
    factoryColumn,
    iuoColumn,
    lockedColumnTemplate,
    assayActionsTemplate,
    iconHeaderTemplate,
    assayNameTemplate,
    panelTemplate,
    panelFusionTemplate) {

    'use strict';

	var Transport = kendo.Class.extend({

        _grid: null,

        /**
         * Constructor
         * @param options
         */
        init: function(grid) {
            this._grid = grid;
        },

        /**
         * Method for fetching data
         *
         * @param options
         */
        read: function(options) {
            $.ajax({
                url: this._grid._url + '?' + $.param(_.extend({},
                    this._parameterMap(options.data),
                    this._grid._filters
                )),
                type: 'POST',
		data: JSON.stringify(this._grid._filters),
                contentType: 'application/json',
                success: options.success,
                error: options.error
            });
        },

        /**
         * Convert kendo grid parameters to spring parameters
         *
         * @param options
         * @returns {Object|*|Mixed}
         * @private
         */
        _parameterMap: function(options) {
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
     * A re-usable assay grid view
     *
     * @type {*}
     */
    var AssayGridView = KendoGridView.extend({

        _url: '/ir/secure/api/assay',

        _model: Model,

        _fields: {
            status : {
                type : 'string'
            },
            applicationType : {
                type : 'string'
            },
            name : {
                type : 'string'
            },
            factoryProvided : {
                type : 'boolean'
            }
        },

        _sort: [{
            field : 'createdDate',
            dir : 'desc'
        }],

        _selectable: false,

        initialize: function(options) {
            KendoGridView.prototype.initialize.apply(this, arguments);

            this.loadPlugin('actions');

            _.extend(this, _.defaults(options || {}, {
                nameHasAction: true
            }));
        },

	_transportCls: Transport,

        _columns: function() {

        	var factoryAssayColumn = this.cb()
	            .field('createdBy')
				.sortable(false)
				.title(' ')
	            .template(factoryColumn)
	            .build();

        	var iuoAssayColumn = this.cb()
				.sortable(false)
				.title(' ')
	            .template(iuoColumn)
	            .build();

            var statusColumn = this.cb()
                .field('state')
                .width('2%')
				.sortable(false)
				.title(' ')
                .template(lockedColumnTemplate)
                .build();

            var nameColumn = this.cb()
                .field('assayName')
                .width('20%')
                .title($.t('grid.column.assay'))
                .attributes({
                    'class': 'vertical-align-middle'
                })
                .template(assayNameTemplate)
                .build();


            var applicationColumn = this.cb()
	            .field('application')
				.title($.t('analysis.summary.application'))
	            .build();

           var fusionPanelColumn = this.cb()
	       	.field('fusionBedfile')
	       	.width('12%')
	       	.title($.t('grid.column.rnaPanel'))
			.sortable(false)
			.template(panelFusionTemplate)
	       	.attributes({
	       	    'class': 'vertical-align-middle'
	       	})
	       	.build();

           var panelColumn = this.cb()
	       	.field('bedfile')
	       	.width('12%')
	       	.title($.t('grid.column.dnaPanel'))
			.sortable(false)
			.template(panelTemplate)
	       	.attributes({
	       	    'class': 'vertical-align-middle'
	       	})
	       	.build();

	    var stateColumn =  this.cb()
                .field('state')
                .title($.t('grid.column.status'))
                .build();

	     var createdByColumn = this.cb()
	        .field('createdBy')
	        .title($.t('grid.column.createdBy'))
	        .attributes({
	            'class': 'vertical-align-middle'
	        })
	        .build();

            var createdOnColumn = this.cb()
                .field('createdDate')
                .title($.t('grid.column.createdOn'))
                .template('#= (createdDate != null) ? kendo.toString(new Date(Date.parse(createdDate)),"yyyy-MM-dd HH:mm") : "" #')
                .attributes({
                    'class': 'vertical-align-middle'
                })
                .build();

            var reanalysisColumn = this.cb()
		    	.field('reanalysisCount')
	            .title($.t('grid.column.reanalysis'))
	            .attributes({
	                'class': 'vertical-align-middle',
                  'style':'text-align: center;'
	            }).sortable(false)
	            .template('<a href="javascript:void(0)" data-action="view_reanalysis">#= (reanalysisCount != 0) ? reanalysisCount : "" #</a>')
	            .build();

				var actionsColumn = this.cb()
				.title($.t('grid.column.action'))
				.template(assayActionsTemplate)
				.build();

            return [
                factoryAssayColumn,
                iuoAssayColumn,
                statusColumn,
                nameColumn,
                applicationColumn,
                panelColumn,
                fusionPanelColumn,
                stateColumn,
                createdByColumn,
                createdOnColumn,
                reanalysisColumn,
                actionsColumn
            ];
        }

    });

    return AssayGridView;

});
