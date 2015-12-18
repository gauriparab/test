/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/assay/cnvModel',
    'hb!templates/grid/grid-column-cnv-name.html',
    'hb!templates/grid/grid-column-cnv-locked.html',
    'hb!templates/grid/grid-column-cnv-actions.html',
    'hb!templates/grid/grid-column-cnv-notes.html'
].concat(
    'utils/templateFunctions',
    'views/common/grid/plugins/actionsGridPlugin'
), function(
    $,
    _,
    kendo,
    KendoGridView,
    Model,
    nameTemplate,
    lockedColumnTemplate,
    cnvActionsTemplate,
    cnvNotesTemplate) {

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
    var CNVGridView = KendoGridView.extend({

        _url: '/ir/secure/api/cnv/searchCnvBaseline',

        _model: Model,

        _fields: {
            status : {
                type : 'string'
            },
            name : {
                type : 'string'
            }
        },

        /*_sort: [{
            field : 'createdDate',
            dir : 'desc'
        }],*/
        
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
        	
        	var defaultColumn = this.cb()
        		.field('')
        		.width('4%')
        		.template(lockedColumnTemplate)
        		.build();

            var nameColumn = this.cb()
                .field('name')
                .title($.t('cnv.baseline.grid.title.name'))
                .width('20%')
                //.template('<a href="javascript:void(0)" data-action="view_details">#= (name) ? name : "" #</a>')
                .template(nameTemplate)
                .build();
            
            var panelColumn = this.cb()
            	.field('panelFile.name')
            	.title($.t('assay.panel.label'))
            	.build();

            var stateColumn = this.cb()
                .field('status')
                .title($.t('cnv.baseline.grid.title.state'))
                .build();
            
           var createdByColumn = this.cb()
		       	.field('createdBy')
		       	.title($.t('cnv.baseline.grid.title.createdBy'))
		       	.build();
           
           var statusColumn =  this.cb()
                .field('state')
                .title($.t('cnv.baseline.grid.title.status'))
                .build(); 

           var createdOnColumn = this.cb()
		        .field('createdDate')
		        .title($.t('cnv.baseline.grid.title.createdOn'))
		        .build();
            
           var notesColumn = this.cb()
                .title($.t('cnv.baseline.grid.title.notes'))
                .template(cnvNotesTemplate)
                .build();
            
            var actionsColumn = this.cb()
	            .title($.t('cnv.baseline.grid.title.actions'))
	            .width('15%')
	            .template(cnvActionsTemplate)
	            .build();

            return [
                defaultColumn,
                nameColumn,
                panelColumn,
                statusColumn,
                stateColumn,
                createdByColumn,
                createdOnColumn,
                notesColumn,
                actionsColumn
            ];
        }

    });

    return CNVGridView;

});