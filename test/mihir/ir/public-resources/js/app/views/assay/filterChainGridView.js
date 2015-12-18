/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/filterChain',
    'hb!templates/grid/grid-column-presets-name.html',
    'hb!templates/grid/grid-column-filterChain-status.html',
    'hb!templates/grid/grid-presets-actions.html'
].concat(
    'utils/templateFunctions',
    'views/common/grid/plugins/actionsGridPlugin'),

    function($,
             _,
             kendo,
             KendoGridView,
             FilterChain,
             nameTemplate,
             statusTemplate,
             actionTemplate){

        'use strict';
        
        var FilterChainGridView = KendoGridView.extend({

            _url: '/ir/secure/api/filterChain/findFilterChains',

            _model: FilterChain,

            initialize: function(options) {
                KendoGridView.prototype.initialize.apply(this, arguments);
                this.loadPlugin('actions');
            },
	
            _columns: function() {

            	var columns = [];

                var nameColumn = this.cb()
                    .field('name')
                    .title($.t('grid.header.label.name'))
                    .template(nameTemplate)
                    .build();
				
                var statusColumn = this.cb()
	                .field('status')
	                .title($.t('grid.column.status'))
	                .template(statusTemplate)
	                .build();
					
                var createdByColumn = this.cb()
                    .field('createdBy')
                    .title($.t('grid.header.label.createdBy'))
                    .template('#= (createdBy != null) ? createdBy.firstName + " " + createdBy.lastName : "" #')
                    .build();
				
                var createdOnColumn = this.cb()
                    .field('createdOn')
                    .title($.t('grid.header.label.createdOn'))
                    .template('#= (createdOn != null) ? kendo.toString(new Date(Date.parse(createdOn)),"yyyy-MM-dd HH:mm") : "" #')
                    .build();
                
                var actionsColumn = this.cb()
                	.title($.t('actions.dropdown.label'))
        		    .template(actionTemplate)
        		    .width("70px")
        		    .build();
                               
				columns.push(nameColumn);
				columns.push(statusColumn);
				columns.push(createdByColumn);
				columns.push(createdOnColumn);
				columns.push(actionsColumn);

		        return columns;
            }

        });

        return FilterChainGridView;

    }
);
