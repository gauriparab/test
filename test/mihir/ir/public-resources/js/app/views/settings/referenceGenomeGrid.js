/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/referenceGenome'
], function(
    $,
    _,
    kendo,
    KendoGridView,
    Hotspot) {

    'use strict';

    /**
     * A re-usable attributes grid view
     *
     * @type {*}
     */
    var ReferenceGenomeGridView = KendoGridView.extend({

        _url: '/ir/secure/api/settings/genomicReference',

        _model: Hotspot,

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
        	
        	var descriptionColumn = this.cb()
        		.field('description')
        		.width('40%')
        		.title($.t('settings.label.desription'))
        		.build();
        	
        	 var createdByColumn =  this.cb()
	            .field('createdBy')
	            .title($.t('grid.header.label.createdBy'))
	            .build();
				
	        var createdOnColumn = this.cb()
	            .field('createdOn')
	            .title($.t('grid.column.createdOn'))
	            .template('#= (createdOn != null) ? kendo.toString(new Date(Date.parse(createdOn)),"yyyy-MM-dd HH:mm") : "" #')
	            .build();
	        
	        var indexVersionColumn = this.cb()
	        	.field('indexVersion')
	        	.title($.t('grid.header.label.indexVersion'))
	        	.build();
        
	        var genomeLengthColumn = this.cb()
	        	.field('genomeLength')
	        	.title($.t('grid.header.label.genomeLength'))
	        	.build();			
	        
	        var statusColumn = this.cb()
	            .field('status')
	            .title($.t('grid.column.status'))
	            .build();
				
			var stateColumn =  this.cb()
	            .field('state')
	            .title($.t('grid.header.label.state'))
	            .build();
	
	        return [
	            nameColumn,
	            descriptionColumn,
				createdByColumn,
	            createdOnColumn,
	            statusColumn,
				stateColumn,
				indexVersionColumn
	        ];
        
        }

    });

    return ReferenceGenomeGridView;

});
