define([
    'views/ParentView',
    'views/dashBoardGridView'
    'hb!templates/dashboard-view.html'],
        function(
                ParentView,
                DashBoardGridView,
                template) {
            'use strict';

            var dashboardView = ParentView.extend({
            	_gridEl: '#grid',
            	initialize: function(options) {
            		
            	},
                render: function() {
                    this.$el.html(template());
                }
            });
            return dashboardView;
        });
