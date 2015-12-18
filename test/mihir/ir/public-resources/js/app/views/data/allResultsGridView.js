/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/assay/assayModel',
    'views/assay/assayDetailView',
    'hb!templates/grid/grid-column-data-planned-run.html',
    'hb!templates/grid/grid-column-default-result.html',
    'hb!templates/grid/grid-action-allrusults.html',
    'hb!templates/grid/grid-column-status.html',
    'hb!templates/grid/grid-column-icon-runStatusInstrumentTemplate.html',
    'hb!templates/grid/grid-column-all-results-notes.html',
    'hb!templates/grid/grid-column-assay.html'
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
    plannedRunNameTemplate,
    defaultResultTemplate,
    actionTemplate,
    templateStatus,
    runStatusInstrumentTemplate,
    notesTemplate,
    templateAssay){

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
                type: 'GET',
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

        _url: '/ir/secure/api/data/results',

        _model: Model,

        _sort: [
           {
        	   field : 'planRun',
        	   dir : 'desc'
           },
           {
        	   field:'runStatus',
        	   dir:'desc'
           },
           {
        	   field:'qcStatus',
        	   dir:'desc'
           },
           {
        	   field:'assay.value',
        	   dir:'desc'
           }
        ],

        initialize: function(options) {
            KendoGridView.prototype.initialize.apply(this, arguments);
		    if(options.assayId && options.specimenId){
		    	this._filters = { assayId : options.assayId, specimenId : options.specimenId };
		    }
            this.loadPlugin('actions');
            _.extend(this, _.defaults(options || {}, {
                nameHasAction: true
            }));
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
            
            var actions= this.$el.find('table tbody tr td:last-child');
            for(var i=0; i<actions.length ; i++) {
        		var actionContent= actions[i].innerHTML;
        		var n=actionContent.lastIndexOf("|");
        		if(n !== -1) {
        			var action=actionContent.substring(0,n);
            	    actions[i].innerHTML=action;
        		}
        	}
        },
        
	_transportCls: Transport,

        _columns: function() {
	
            var plannedRunColumn = this.cb()
        		.field('planRun')
        		.sortable(true)
        		.title($.t('verification.run.plannedRun'))
        		.template(plannedRunNameTemplate)
        		.build();
            
            var libraryNameColumn = this.cb()
            	.field('libraryNames')
            	.sortable(false)
	            .title($.t('grid.column.libraryName'))
	            .build();
            
            var assayColumn = this.cb()
                .field('assay.value')
                .sortable(true)
                .title($.t('grid.column.assay'))
                .template(templateAssay)
                .attributes({
                    'class': 'vertical-align-middle'
                })
                .build();
            	
            var runStatusColumn = this.cb()
	            .field('runStatus')
	            .sortable(false)
	            .title($.t('monitor.run.runStatus'))
	            .attributes({
	                'class': 'vertical-align-middle'
	            })
	            .template(runStatusInstrumentTemplate)
	            .build();        
            
            var notesColumn = this.cb()
	    		.field('notes')
	    		.sortable(false)
	    		.title($.t('sample.planARun.addNote'))
	    		.template(notesTemplate)
	    		.build();
	    
		    var actionsColumn = this.cb()
			    .title($.t('grid.column.action'))
			    .template(actionTemplate)
			    .sortable(false)
			    .width("23%")
			    .build();
	    

            return [
                plannedRunColumn,
                libraryNameColumn,
                assayColumn,
                runStatusColumn,       
                notesColumn,
                actionsColumn
            ];
        }

    });

    return AssayGridView;

});
