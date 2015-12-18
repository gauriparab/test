/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/sampleAttribute',
    'hb!templates/grid/grid-attribute-name.html',
    'hb!templates/grid/grid-attribute-actions.html'
].concat(
    'utils/templateFunctions',
    'views/common/grid/plugins/actionsGridPlugin'
), function(
    $,
    _,
    kendo,
    KendoGridView,
    Attribute,
    attributeNameTemplate,
    actionTemplate) {

    'use strict';

    /**
     * A re-usable attributes grid view
     *
     * @type {*}
     */
    var AttributesGridView = KendoGridView.extend({

        _url: '/ir/secure/api/attributes/allAttributes',

        _model: Attribute,

        _sort: [{
            field : 'attributeName',
            dir : 'asc'
        }],

        initialize: function(options) {
            KendoGridView.prototype.initialize.apply(this, arguments);
            this.loadPlugin('actions');
            _.extend(this, _.defaults(options || {}, {
                nameHasAction: true
            }));
        },

        _columns: function() {

            var attributeNameColumn = this.cb()
                .field('attributeName')
                .title($.t('grid.column.attributeName'))
                .sortable(false)
                //.template(attributeNameTemplate)
                .build();
	
            var dataTypeColumn = this.cb()
                .field('dataType')
                .title($.t('grid.column.dataType'))
                .sortable(false)
                .template('#= (dataType == "Multiple") ? "Text" : dataType #')
                .build();

            var isObsoleteColumn = this.cb()
                .field('obsoleteDate')
                .title($.t('grid.column.obsolete'))
                .sortable(false)
                .template('#= (obsoleteDate != null) ? kendo.toString(new Date(Date.parse(obsoleteDate)),"yyyy-MM-dd HH:mm") : "" #')
                .build();

            var typeColumn = this.cb()
                .field('isCustom')
                .title($.t('grid.column.attributType'))
                .sortable(false)
                .template('#= (isCustom) ? "Custom" : "Default" #')
                .build();

            var requiredColumn = this.cb()
                .field('isMandatory')
                .title($.t('grid.column.required'))
                .sortable(false)
                .template('#= (isMandatory) ? "Yes" : "No" #')
                .build();

            var actionsColumn = this.cb()
                .title($.t('grid.column.action'))
                .sortable(false)
                .width('6%')
                .template(actionTemplate)
                .build();
            
            var createdBy = this.cb()
            	.field('createdBy')
            	.title($.t('grid.column.createdBy'))
            	.sortable(false)
            	.build();

            var createdOn = this.cb()
	        	.field('createdOn')
	        	.title($.t('grid.column.createdOn'))
	        	.sortable(false)
	        	.build();
            
            return [
                attributeNameColumn,
                dataTypeColumn,
                typeColumn,
                requiredColumn,
                createdBy,
                createdOn,
                isObsoleteColumn,
                actionsColumn
            ];

        
	}

    });

    return AttributesGridView;

});
