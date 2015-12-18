/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/assay/classificationSetModel',
    'hb!templates/grid/grid-sample-description.html',
    'hb!templates/grid/grid-column-classification-actions.html'
].concat(
		'utils/templateFunctions',
'views/common/grid/plugins/actionsGridPlugin'),
function(
    $,
    _,
    kendo,
    KendoGridView,
    ClassificationSet,
    descriptionTemplate,
    actionsTemplate) {

    'use strict';

    /**
     * A re-usable attributes grid view
     *
     * @type {*}
     */
    var ClassificationSetGrid = KendoGridView.extend({

        _url: '/ir/secure/api/rdxClassifications/getClassifications',

        _model: ClassificationSet,

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
	            .build();
        	
        	var classificationListColumn = this.cb()
	            .field('classificationList')
	            .title($.t('classification.set.label.terms'))
	            .build();
        	

	        var createdOnColumn = this.cb()
	            .field('createdOn')
	            .title($.t('grid.column.createdOn'))
	            .template('#= (createdOn != null) ? kendo.toString(new Date(Date.parse(createdOn)),"yyyy-MM-dd HH:mm") : "" #')
	            .build();
	
            var createdByColumn =  this.cb()
	            .field('createdBy')
	            .title($.t('grid.column.createdBy'))
	            .build();
            
	        var statusColumn = this.cb()
	            .field('status')
	            .title($.t('grid.header.label.status'))
	            .build();
	        
            var actionsColumn = this.cb()
	            .title($.t('actions.dropdown.label'))
	            .template(actionsTemplate)
	            .build();
	
	        return [
	            nameColumn,
	            classificationListColumn,
	            statusColumn,
	            createdByColumn,
	            createdOnColumn,
	            actionsColumn
	        ];
        
        }

    });

    return ClassificationSetGrid;

});
