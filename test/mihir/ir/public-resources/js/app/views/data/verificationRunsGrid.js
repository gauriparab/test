/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/assay/installTemplate',
    'hb!templates/grid/grid-column-data-verification-run.html',
    'hb!templates/grid/grid-column-locked.html',
    'hb!templates/grid/grid-column-icon-header.html',
    'hb!templates/grid/grid-column-icon-runStatusInstrumentTemplate.html',
    'hb!templates/grid/grid-column-qCStatus.html',
    'hb!templates/grid/grid-column-oneTouchDate.html',
    'hb!templates/grid/grid-column-pgmDate.html',
    'hb!templates/grid/grid-verification-run-action.html'
].concat(
    'utils/templateFunctions',
    'views/common/grid/plugins/actionsGridPlugin'
), function(
    $,
    _,
    kendo,
    KendoGridView,
    InstallTemplate,
    verificationRunsNameTemplate,
    lockedColumnTemplate,
    iconHeaderTemplate,
    runStatusInstrumentTemplate,
    templateStatus,
    templateOTDate,
    templatePGMDate,
    templateActions) {

    'use strict';

    /**
     * A re-usable templates grid view
     *
     * @type {*}
     */
    var TemplateGridView = KendoGridView.extend({

        _url: '/ir/secure/api/installTemplate/list',

	_model: InstallTemplate,

        _sort: [{
            field : 'plannedRun',
            dir : 'desc'
        }],

        initialize: function(options) {
            KendoGridView.prototype.initialize.apply(this, arguments);
            this.loadPlugin('actions');
        },
        
        _columns: function() {

            var plannedRunColumn = this.cb()
	            .field('plannedRun')
	            .title($.t('verification.run.plannedRun'))
	            .template(verificationRunsNameTemplate)
	            .build();
            
            var fieldEngNameColumn = this.cb()
	            .field('fieldEngineerName')
	            .title($.t('verification.run.fieldEngName'))
	            .sortable(false)
	            .build();
            
            var instrumentNameColumn = this.cb()
	            .field('instrumentName')
	            .title($.t('verification.run.instrumentName'))
	            .build();
            
            var otCompletionColumn = this.cb()
	            .field('oneTouchCompletion')
	            .title($.t('verification.run.otCompletion'))
	            .template(templateOTDate)
	            .build();
            
            var pgmCompletionColumn = this.cb()
	            .field('pgmCompletion')
	            .title($.t('verification.run.pgmCompletion'))
	            .template(templatePGMDate)
	            .build();
            
            var analysisCompletionColumn = this.cb()
	            .field('analysisCompletion')
	            .title($.t('verification.run.analysisCompletion'))
	            .build();
            
            var runStatusColumn = this.cb()
	            .field('runStatus')
	            .title($.t('monitor.run.runStatus'))
	            .template(runStatusInstrumentTemplate)
	            .build();
            
            var qcStatusColumn = this.cb()
	            .field('qCStatus')
	            .title($.t('grid.column.qcStatus'))
	            .template(templateStatus)
	            .build();
            
            var resultsColumn = this.cb()
	            .field('results')
	            .width("8%")
	            .title($.t('grid.column.pqReport'))
		    .template('<a href="javascript:void(0)" data-action="view_report">#= (signOff) ? results.value : ""  #</a> ')
	            .build();
            
            var actionsColumn = this.cb()
	     		.title($.t('grid.column.action'))
	     		.width("8%")
	     		.template(templateActions)
	     		.sortable(false)
	     		.build();
         
            return [
				plannedRunColumn,
				fieldEngNameColumn,
				instrumentNameColumn,
				otCompletionColumn,
				pgmCompletionColumn,
				analysisCompletionColumn,
				runStatusColumn,
				qcStatusColumn,
				resultsColumn,
                actionsColumn
            ];
	}

    });

    return TemplateGridView;

});
