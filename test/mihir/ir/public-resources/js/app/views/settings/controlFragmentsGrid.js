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
    DnaBarcode) {

    'use strict';

    /**
     * A re-usable attributes grid view
     *
     * @type {*}
     */
    var GeneListGridView = KendoGridView.extend({

        _url: '/ir/secure/api/settings/getControlFragments',

        _model: DnaBarcode,

        _sort: [{
            field : 'control',
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
	            .build();

	        var sequenceColumn = this.cb()
	            .field('sequence')
	            .title($.t('grid.column.sequence'))
	            .width('600px')
	            .build();
	        
	        var controlsColumn = this.cb()
	            .field('control')
	            .title($.t('grid.header.label.control'))
	            .build();
	        
	        var commentsColumn = this.cb()
	            .field('comments')
	            .title($.t('grid.header.label.comments'))
	            .build();
	        
	        var statusColumn = this.cb()
	            .field('status')
	            .title($.t('grid.header.label.status'))
	            .build();
	
	        return [
	            nameColumn,
	            sequenceColumn,
	            controlsColumn,
	            statusColumn
	        ];
        
        }

    });

    return GeneListGridView;

});
