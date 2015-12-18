/*global define:false*/
define([
    'views/common/grid/kendoGridView',
    'models/assay/planRunModel',
    'hb!templates/grid/grid-column-plannedRun-name.html',
    'hb!templates/grid/grid-action-planned-runs.html',
    'hb!templates/grid/grid-column-notes.html'
].concat(
    'utils/templateFunctions',
    'views/common/grid/plugins/actionsGridPlugin',
    'views/common/grid/plugins/multiSelectionGridPlugin'
), function(
    KendoGridView,
    PlanRunModel,
    nameTemplate,
    plannedActionsTemplate,
    notesColumnTemplate) {

    'use strict';

    /**
     * A re-usable templates grid view
     *
     * @type {*}
     */
    var PlannedRunsGridView = KendoGridView.extend({

        _url: '/ir/secure/api/planrun/listPlanRun',

        _model: PlanRunModel,

        _sort: [{
            field : 'updatedDate',
            dir : 'desc'
        }],
        
        _onGridDataBound: function() {
            _.each(this.$el.find("div.dropdown"), function(div) {
                $(div).parent().css("overflow", "visible");
            });
            
            $(function () { $("[data-toggle='popover']").popover(); });
            
            _.each(this._loadedPlugins, function(plugin) {
                plugin.onGridDataBound();
            });
         },
        
        initialize: function(options) {
            KendoGridView.prototype.initialize.apply(this, arguments);
            this.loadPlugin('actions');
	    this.loadPlugin('multiSelection');
            _.extend(this, _.defaults(options || {}, {
                nameHasAction: true
            }));
        },
        
        _columns: function() {
        	
        	 var numberOfLibrariesColumn = this.cb()
             	.field('noOfLibraries')
             	.sortable(false)
             	.title($.t('planned.grid.noOfLibraries'))
             	.width('10%')
             	.build();
        	 
        	 var plannedRunsNameColumn = this.cb()
        	 	.field('planName')
        	 	.title($.t('planned.grid.plannedRunName'))
        	 	//.template("<a href='javascript:void(0)' data-action='plan-review'>#= planName #</a>")
        	 	.template(nameTemplate)
        	 	.build();
        	 
        	 var plannedRunsAssayColumn = this.cb()
     	 		.field('assayName')
     	 		.title($.t('planned.runs.assay'))
     	 		.build();
        	 
        	 var plannedRunsShortCodeColumn = this.cb()
  	 			.field('planShortId')
  	 			.title($.t('planned.runs.runShortCode'))
  	 			.build();
        	
        	 var plannedRunsTubeLabelColumn = this.cb()
	 			.field('tubeLabel')
	 			.title($.t('planned.runs.tubeLabel'))
	 			.build();
        	 
        	 var plannedRunsNotesColumn = this.cb()
        	 	.template(notesColumnTemplate)
	 			.field('notes')
	 			.sortable(false)
	 			.title($.t('planned.grid.notes'))
	 			.build();
        	 
        	 var actionsColumn = this.cb()
	    		.title($.t('grid.column.action'))
	    		.field('state')
	    		.sortable(false)
	    		.width('10%')
	    		.template(plannedActionsTemplate)
	    		.build();

        	 return [
                 plannedRunsShortCodeColumn,
                 plannedRunsNameColumn,
                 plannedRunsAssayColumn,
                 plannedRunsTubeLabelColumn,
                 numberOfLibrariesColumn,
                 plannedRunsNotesColumn,
                 actionsColumn
             ];
        }

    });

    return PlannedRunsGridView;

});
