/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/referenceGenome',
    'hb!templates/grid/grid-column-gene-list-name.html',
    'hb!templates/grid/grid-column-gene-list-actions.html'
].concat(
	    'utils/templateFunctions',
	    'views/common/grid/plugins/actionsGridPlugin'
	), function(
    $,
    _,
    kendo,
    KendoGridView,
    DnaBarcode,
    nameTemplate,
    actionsTemplate) {

    'use strict';

    /**
     * A re-usable attributes grid view
     *
     * @type {*}
     */
    var GeneListGridView = KendoGridView.extend({

        _url: '/ir/secure/api/settings/getGeneFiles',

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
	            .template(nameTemplate)
	            .build();

	        var statusColumn = this.cb()
	            .field('status')
	            .title($.t('grid.column.status'))
	            .build();

	        var stateColumn = this.cb()
	            .field('state')
	            .title($.t('grid.header.label.state'))
	            .build();

	        var createdByColumn = this.cb()
	            .field('createdBy')
	            .title($.t('grid.header.label.createdBy'))
	            .build();

	        var createdOnColumn = this.cb()
	            .field('createdOn')
	            .title($.t('grid.header.label.createdOn'))
	            .build();

	        var notesColumn = this.cb()
	            .field('description')
	            .title($.t('grid.header.label.notes'))
	            .build();

	        var actionsColumn = this.cb()
    	    		.title($.t('actions.dropdown.label'))
    	    		.template(actionsTemplate)
    	    		.width('22%')
    	    		.build();

	        return [
	            nameColumn,
	            statusColumn,
	            stateColumn,
	            createdByColumn,
	            createdOnColumn,
	            actionsColumn
	        ];

        }

    });

    return GeneListGridView;

});
