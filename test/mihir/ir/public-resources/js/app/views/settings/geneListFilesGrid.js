/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView'
], function(
    $,
    _,
    kendo,
    KendoGridView) {

    'use strict';

    /**
     * A re-usable attributes grid view
     *
     * @type {*}
     */
    var GeneListFilesGrid= KendoGridView.extend({

        _url: '/ir/secure/api/settings/getGenes',


        _sort: [{
            field : 'createdOn',
            dir : 'desc'
        }],

        initialize: function(options) {
        	this.customAttributes= options.customAttributes;
        	this.showTherapyCol=options.showTherapyCol;
            KendoGridView.prototype.initialize.apply(this, arguments);
        },

        _columns: function() {
        	
        	var columns=[]

        	var nameColumn = this.cb()
	            .field('geneName')
	            .title($.t('settings.references.allGenes.geneName'))
	            .build();
        	
        	var displayNameColumn = this.cb()
	            .field('displayName')
	            .title($.t('variant.table.displayName'))
	            .build();
        	
        	var mutantIdColumn = this.cb()
	            .field('mutantId')
	            .title($.t('grid.header.label.mutantId'))
	            .build();
        	
        	var therapyColumn = this.cb()
	            .field('therapy')
	            .title($.t('variant.table.fdaApprovedDrug'))
	            .build();
        	
	        
	        columns.push(nameColumn);
	        columns.push(mutantIdColumn);
	        columns.push(displayNameColumn);
	        if(this.showTherapyCol) {
	        	columns.push(therapyColumn);
	        }
	        
	        var self = this;
			_.each(this.customAttributes, function(attribute, index) {
			    var temp = self.cb()
				.field(attribute.attributeName)
				.title(attribute.attributeName)
				.template('#= (customAttributeList && customAttributeList[' + index + ']) ? customAttributeList[' + index + '].attributeValue : "" #')
				.build();
			    columns.push(temp);
			});
	        
	        
	
	        return columns;
        
        }

    });

    return GeneListFilesGrid;

});
