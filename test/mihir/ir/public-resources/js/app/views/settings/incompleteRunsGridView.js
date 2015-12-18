/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/baseModel'
].concat(
	    'views/common/grid/plugins/rowSelectionGridPlugin',
	    'views/common/grid/plugins/actionsGridPlugin',
	    'views/common/grid/plugins/multiSelectionGridPlugin'), 
function(
    $,
    _,
    kendo,
    KendoGridView,
    BaseModel) {

    'use strict';

    /**
     * A re-usable attributes grid view
     *
     * @type {*}
     */
    var PanelsGridView = KendoGridView.extend({

        _url: '/ir/secure/api/settings/datamanagement/getIncompleteRuns',

        _model: BaseModel,

        _sort: [],

        initialize: function(options) {
            KendoGridView.prototype.initialize.apply(this, arguments);
            this.loadPlugin('actions');
            this.loadPlugin('rowSelection');
            this.loadPlugin('multiSelection');
        },

        _columns: function() {

            var plannedRunColumn = this.cb()
                .field('plannedRun')
                .title($.t('grid.header.label.plannedRuns'))
                .build();
	
            var assayNameColumn = this.cb()
                .field('assayName')
                .title($.t('grid.header.label.assayName'))
                .build();

            var resultNameColumn = this.cb()
                .field('resultName')
                .title($.t('grid.header.label.resultName'))
                .build();
            
            var pgmStatusColumn =  this.cb()
	            .field('pgmStatus')
	            .title($.t('grid.header.label.pgmStatus'))
	            .build();
            
            var analysisStatusColumn =  this.cb()
	            .field('analysisStatus')
	            .title($.t('grid.header.label.analysisStatus'))
	            .build();             

            return [
                plannedRunColumn,
                assayNameColumn,
                resultNameColumn,
                pgmStatusColumn,
                analysisStatusColumn
            ];
        }
    });
    return PanelsGridView;
});