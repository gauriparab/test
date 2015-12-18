/*global define:false*/
define([ 'jquery', 'underscore', 'backbone', 'views/assay/manageTemplateGridView', 'views/assay/addPlanRunView', 'views/assay/templateDetailsView', 'views/common/bannersView', 'views/common/baseModalView', 'hb!templates/assay/install-template-overview.html'],
    function($, _, Backbone, ManageTemplatesGridView, AddPlanRunView, TemplateDetailsView, BannerView, BaseModalView, template) {
        'use strict';

        /**
         * Sample overview page
         *
         * @type {*}
         */
        var installTemplatesOverview = Backbone.View.extend({

            _template: template,

            _gridEl: '#viewtemplate-grid',

            initialize: function(options) {
                this.gridView = new ManageTemplatesGridView();
            },

            render: function() {
                this.$el.html(this._template({defineActions : this.options.defineActions }));
                this.gridView.setElement(this.$(this._gridEl)).render();
                this.gridView.on('action:plan', this._onPlan, this);
                this.gridView.on('action:view_details', this._onViewDetails, this);
            },
            
            delegateEvents: function() {
                Backbone.View.prototype.delegateEvents.apply(this, arguments);
            },

		    _onPlan: function(e, template) {
		    	BaseModalView.open(null, {
                    el: "#planRunModal",
                    installTemplate: template.toJSON()
                }, AddPlanRunView);
		    },
	
		    _onViewDetails: function(e, template) {
		    	BaseModalView.open(null, {
                    el: "#templateDetailsModal",
                    templateId : template.toJSON().id,
		    		templateName : template.toJSON().externalName
                }, TemplateDetailsView);
		    }            
        });

        return installTemplatesOverview;
    }
);
