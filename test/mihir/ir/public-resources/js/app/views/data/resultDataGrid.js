/*global define:false*/
define([
    'views/common/grid/kendoGridView',
    'models/data/result'
].concat(
    'utils/templateFunctions',
    'views/common/grid/plugins/actionsGridPlugin'
), function(
    KendoGridView,
    Result
    ) {

    'use strict';

    /**
     * A re-usable templates grid view
     *
     * @type {*}
     */
    var DataGridView = KendoGridView.extend({

        _url: '/ir/secure/api/data',

        _model: Result,

        _sort: [{
            field : 'id',
            dir : 'desc'
        }],

        initialize: function(options) {
            KendoGridView.prototype.initialize.apply(this, arguments);
            this.loadPlugin('actions');
        },
        
        _columns: function() {
        	
        	var specimenIdColumn = this.cb()
	            .field('specimen.value')
	            .title($.t('grid.label.specimenId'))
	            .template("<a href='javascript:void(0)' data-action='view-details'>#= (specimen != null) ? specimen.value : '' #</a>")
	            .build();
           
            var assayColumn = this.cb()
	            .field('assay.value')
	            .title($.t('planned.runs.assay'))
	            .template('<a href="javascript:void(0)" data-action="view_assayDetails">#= (assay != null) ? assay.value : "" #</a>')
	            .build();
              
            var resultsColumn = this.cb()
	            .field('results')
	            .sortable(false)
	            .title($.t('grid.column.results'))
	            .template('<a href="javascript:void(0)" data-action="view_allResults">#= (results != null) ? results : "" #</a>')
	            .build();
            
            return [
                specimenIdColumn,
				assayColumn,
				resultsColumn,
            ];
	}

    });

    return DataGridView;

});
