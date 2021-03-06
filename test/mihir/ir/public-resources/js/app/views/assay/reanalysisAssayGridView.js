/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/assay/assayModel',
    'views/assay/assayDetailView',
    'hb!templates/grid/grid-action-reanalysis-name.html',
    'hb!templates/grid/grid-column-locked.html',
    'hb!templates/grid/grid-column-icon-header.html'
].concat(
    'utils/templateFunctions',
    'views/common/grid/plugins/actionsGridPlugin'
), function(
    $,
    _,
    kendo,
    KendoGridView,
    Model,
    AssayDetailModel,
    nameTemplate,
    lockedColumnTemplate,
    iconHeaderTemplate) {

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

        _url: '/ir/secure/api/assay/reanalysisAssay',

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
            field : 'id',
            dir : 'desc'
        }],

        initialize: function(options) {
            KendoGridView.prototype.initialize.apply(this, arguments);
	    if(options.assayId){
		this._filters = { assayId : options.assayId};
	    }
            this.loadPlugin('actions');

            _.extend(this, _.defaults(options || {}, {
                nameHasAction: true
            }));
        },
        
	_transportCls: Transport,

        _columns: function() {

            var statusColumn = this.cb()
                .field('state')
                .width('2%')
                .title(' ')
				.sortable(false)
                .template(lockedColumnTemplate)
                .build();

            var nameColumn = this.cb()
                .field('assayName')
                .title($.t('grid.column.reanalysisAssay'))
                .template(nameTemplate)
                .attributes({
                    'class': 'vertical-align-middle'
                })
                .build();
            
            var panelColumn = this.cb()
		       	.field('bedfile')
		       	//.width('17%')
		       	.title($.t('grid.column.dnaPanel'))
		       	.sortable(false)
		       	.attributes({
		       	    'class': 'vertical-align-middle'
		       	})
		       	.build();
	           
	        var fusionPanelColumn = this.cb()
		       	.field('fusionBedfile')
		       	//.width('15%')
		       	.title($.t('grid.column.rnaPanel'))
				.sortable(false)
		       	.attributes({
		       	    'class': 'vertical-align-middle'
		       	})
		       	.build();
           
           var statusNameColumn = this.cb()
		       	.field('state')
		       	.title($.t('grid.column.status'))
		       	.sortable(false)
		       	.attributes({
		       	    'class': 'vertical-align-middle'
		       	})
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
	    
	     return [
                statusColumn,
                nameColumn,
                panelColumn,
                fusionPanelColumn,
                statusNameColumn,
                createdByColumn,
                createdOnColumn
            ];
        }

    });

    return AssayGridView;

});
