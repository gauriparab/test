/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'events/eventDispatcher',
    'views/common/grid/kendoGridView',
    'models/assay/cnvModel',
    'hb!templates/grid/grid-column-cnv-specimen.html',
    'hb!templates/grid/grid-column-cnv-assay.html',
    'hb!templates/grid/grid-column-cnv-planned-run.html',
    'hb!templates/grid/grid-column-cnv-qc.html',
    'hb!templates/grid/grid-coloum-samples-checkbox.html',
    'hb!templates/grid/grid-column-cnv-notes.html'
].concat(
    'utils/templateFunctions',
    'views/common/grid/plugins/rowSelectionGridPlugin',
    'views/common/grid/plugins/actionsGridPlugin',
    'views/common/grid/plugins/multiSelectionGridPlugin'
), function(
    $,
    _,
    kendo,
    dispatcher,
    KendoGridView,
    Model,
    specimenNameTemplate,
    assayNameTemplate,
    plannedRunNameTemplate,
    cnvQcTemplate,
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
        	var that = this;
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
    var SamplesGrid = KendoGridView.extend({

        _url: '/ir/secure/api/cnv/getSamples',

        _model: Model,

        /*_fields: {
            status : {
                type : 'string'
            },
            name : {
                type : 'string'
            }
        },

        _sort: [{
            field : 'createdDate',
            dir : 'desc'
        }],*/

        _selectable: false,
        
        _sortable: false,

        initialize: function(options) {
            KendoGridView.prototype.initialize.apply(this, arguments);
            this.loadPlugin('actions');
//            this.loadPlugin('multiSelection');
//            this.loadPlugin('rowSelection');

            _.extend(this, _.defaults(options || {}, {
                nameHasAction: true
            }));
        },

        events:{
        	change: function(event){
        		dispatcher.trigger('change:selection',$(event.target));
        	}
        },

        _onGridDataBound: function(grid) {
		    $("[data-toggle='tooltip']").tooltip();

		    var element = grid.sender.element;
		    $(function () { $("[data-toggle='popover']").popover({html:"true"}); });


		    setTimeout(function(){
		    	dispatcher.trigger('mark:normals');
		    },200);

            _.each(this._loadedPlugins, function(plugin) {
                plugin.onGridDataBound();
            });
        },


        updateDataSource: function(data){
        	this.gridData = data;
        	this.refresh();
        },

        _transportCls: Transport,

        _columns: function() {

            var specimenColumn = this.cb()
                .field('libraryPrepDto.specimenId')
                .title($.t('grid.header.label.specimenName'))
                .width('12%')
                .template(specimenNameTemplate)
                .build();

            var assayColumn = this.cb()
                .field('resultInfoDto.assay.value')
                .title($.t('grid.header.label.assayName'))
                .template(assayNameTemplate)
                .build();

           var plannedRunColumn = this.cb()
		       	.field('resultInfoDto.planRun.value')
		       	.title($.t('grid.header.label.plannedRunName'))
		       	.template(plannedRunNameTemplate)
		       	.build();

           var libraryPrepIdColumn = this.cb()
		       	.field('libraryPrepDto.id')
		       	.title($.t('grid.header.label.libraryPrepId'))
		       	.build();

           var qcStatusColumn =  this.cb()
                .field('resultInfoDto.qcStatus')
                .title($.t('grid.header.label.runMetrics'))
                .template(cnvQcTemplate)
                .build();

           var genderColumn = this.cb()
	      		.field('gender')
	      		.title($.t('grid.header.label.gender'))
	      		.build();

           var normalMaleColumn = this.cb()
           		.title($.t('grid.header.label.normalSpecimen'))
           		.template(cnvActionsTemplate)
           		.width('10%')
           		.build();


            return [
                specimenColumn,
                libraryPrepIdColumn,
                assayColumn,
                plannedRunColumn,
                qcStatusColumn,
                genderColumn,
                normalMaleColumn
            ];
        }

    });

    return SamplesGrid;

});
