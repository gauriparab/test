/*global define:false*/
define([
    'views/common/grid/kendoGridView',
    'models/data/primer'
].concat(
	    'utils/templateFunctions'
	), function(
    KendoGridView,
    Primer) {

    'use strict';

    var PrimerGridView = KendoGridView.extend({

        _url: '/ir/secure/api/settings/pagedprimers',

        _model: Primer,

        _sort: [{
            field : 'createdOn',
            dir : 'desc'
        }],

        initialize: function(options) {
            KendoGridView.prototype.initialize.apply(this, arguments);
        },

        _columns: function() {

        	var nameColumn = this.cb()
	            .field('name')
	            .title($.t('grid.column.name'))
	            .build();
        	
        	var sequenceColumn = this.cb()
        		.field('referenceSequence')
        		.title($.t('grid.column.sequence'))
				.width('60%')
        		.build();
        	
        	var createdByColumn = this.cb()
            	.field('createdBy')
            	.title($.t('grid.header.label.createdBy'))
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
	
	        return [
	            nameColumn,
	            sequenceColumn,
	            createdByColumn,
	            createdOnColumn,
	            statusColumn
	        ];
        
        }

    });

    return PrimerGridView;

});
