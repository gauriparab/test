/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/referenceGenome',
    'hb!templates/grid/grid-column-references-actions.html'
].concat(
	    'utils/templateFunctions',
	    'views/common/grid/plugins/actionsGridPlugin'
	), function(
    $,
    _,
    kendo,
    KendoGridView,
    DnaBarcode,
    actionsTemplate) {

    'use strict';

    /**
     * A re-usable attributes grid view
     *
     * @type {*}
     */
    var FusionPanelGridView = KendoGridView.extend({

        _url: '/ir/secure/api/settings/fusionReference',

        _model: DnaBarcode,

        _sort: [{
            field : 'createdOn',
            dir : 'desc'
        }],

        initialize: function(options) {
            KendoGridView.prototype.initialize.apply(this, arguments);
            this.loadPlugin('actions');
        },

        _columns: function() {

        	var nameColumn = this.cb()
	            .field('name')
	            .title($.t('grid.column.name'))
	            .template('<span>#= (name != 0) ? name : "" #</span>')
	            .build();

             var descriptionColumn = this.cb()
    		.field('description')
    		.title('Description')
    		.build();

             var createdOnColumn = this.cb()
            .field('createdOn')
            .title($.t('grid.column.createdOn'))
            .template('#= (createdOn != null) ? kendo.toString(new Date(Date.parse(createdOn)),"yyyy-MM-dd HH:mm") : "" #')
            .build();

             var statusColumn = this.cb()
             .field('status')
             .title($.t('grid.column.status'))
             .build();


            var referenceSequenceColumn =  this.cb()
             .field('referenceSequence')
             .title($.t('grid.column.referenceSequence'))
             .build();

            var stateColumn =  this.cb()
            .field('state')
            .title($.t('grid.column.state'))
            .build();


            var createdByColumn =  this.cb()
            .field('createdBy')
            .title($.t('grid.column.createdBy'))
            .build();



	        var actionsColumn = this.cb()
	            .title($.t('actions.dropdown.label'))
	            .template(actionsTemplate)
	            .build();

	        return [
	            nameColumn,
	           // referenceSequenceColumn, Defect: 1267 fixed
	            statusColumn,
	            stateColumn,
	            createdByColumn,
	            createdOnColumn,
	            actionsColumn
	        ];

        }

    });

    return FusionPanelGridView;

});
