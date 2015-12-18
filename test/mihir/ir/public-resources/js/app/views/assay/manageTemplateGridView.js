/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/assay/installTemplate',
    'hb!templates/grid/grid-column-locked.html',
    'hb!templates/grid/grid-column-icon-header.html',
    'hb!templates/grid/grid-install-template-actions.html'
].concat(
    'utils/templateFunctions',
    'views/common/grid/plugins/actionsGridPlugin'
), function(
    $,
    _,
    kendo,
    KendoGridView,
    InstallTemplate,
    lockedColumnTemplate,
    iconHeaderTemplate,
    templateActions) {

    'use strict';

    /**
     * A re-usable templates grid view
     *
     * @type {*}
     */
    var TemplateGridView = KendoGridView.extend({

        _url: '/ir/secure/api/assay/installTemplates',

	_model: InstallTemplate,

        _sort: [{
            field : 'createdDate',
            dir : 'desc'
        }],

        initialize: function(options) {
            KendoGridView.prototype.initialize.apply(this, arguments);
            this.loadPlugin('actions');
        },
        
        _columns: function() {

            var statusIconColumn = this.cb()
                .field('status')
                .width('2%')
		.title(' ')
                .template(lockedColumnTemplate)
                .build();
                
            var templateNameColumn = this.cb()
                .field('externalName')
                .title($.t('grid.column.name'))
                .template('<a href="javascript:void(0)" data-action="view_details">#= (externalName) ? externalName : "" #</a>')
                .build();
	
	    var statusColumn = this.cb()
                .field('state')
                .title($.t('grid.column.status'))
                .build();

            var createdByColumn = this.cb()
                .field('createdBy')
                .title($.t('grid.column.createdBy'))
                .build();

            var createdOnColumn = this.cb()
                .field('createdDate')
                .title($.t('grid.column.createdOn'))
		.template('#= (createdDate != null) ? kendo.toString(new Date(Date.parse(createdDate)),"yyyy-MM-dd HH:mm") : "" #')
                .build();
        	
            var actionsColumn = this.cb()
         	.title($.t('grid.column.action'))
		.width("6%")
		.template(templateActions)
         	.build();
         
            return [
                statusIconColumn,
                templateNameColumn,
                statusColumn,
                createdByColumn,
                createdOnColumn,
                actionsColumn
            ];
	}

    });

    return TemplateGridView;

});
