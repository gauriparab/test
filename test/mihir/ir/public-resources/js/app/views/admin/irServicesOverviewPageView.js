/* global define:false */
define(['jquery', 'underscore', 
        'views/templateView', 'views/admin/irServicesGridView',
        'hb!templates/admin/ir-services-overview-page.html'], 
        function($, _, TemplateView, IRServicesGridView, template) {
    'use strict';
    
    var IRServicesOverviewPage = TemplateView.extend({
        
        initialize: function() {
            this._gridView = new IRServicesGridView();
        },

        render: function() {

            this.$el.html(template());
            this._gridView.setElement(this.$('#ir-services-grid')).render();

            return this;
        }

    });
    
    return IRServicesOverviewPage;
});
