/* global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'views/assay/reanalysisAssayGridView',
    'views/common/baseModalView',
    'views/common/auditTrailView',
    'hb!templates/assay/reanalysis-assay-overview-page.html',
    'views/assay/assayDetailView'
],
    function(
        $,
        _,
        Backbone,
        ReanalysisAssayGridView,
        BaseModalView,
        AuditTrailView,
        template,
        AssayDetailModel) {
	'use strict';

    /**
     * Reanalysis Assay overview page
     *
     * @type {*}
     */
    var AssayOverviewPageView = Backbone.View.extend({

        _template: template,
        _gridEl: '#viewassay-grid',

        initialize: function(options) {
            options = options || {};	
            this.gridView = new ReanalysisAssayGridView({
            	assayId : options.assayId
		    });
		    this.gridView.on('action:view_details', this._viewDetails, this);
		    this.gridView.on('action:audit_trail', this._onAudit, this);
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
        },

        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
            this.$el.html(this._template({
                
            }));
            this.gridView.setElement(this.$(this._gridEl)).render();
        },
        
		_viewDetails: function(e, assay) {
            BaseModalView.open(null, {
                assayId : assay.toJSON().id
            }, AssayDetailModel);
		},
		
		_onAudit: function(e, assay){
			var data=[];
			var temp={};
			temp.key="audit.trail.assayid";
			temp.value=assay.toJSON().id;
			data.push(temp);
			var self = this;
			BaseModalView.open(null, {
				type: "audit_trail",
				el: "#auditTrailModal",
				model:assay,
				data:data,
				gridViewUrl:'/ir/secure/api/auditmanagement/assay',
				filters:{assayId : assay.toJSON().id},
				detailsViewUrl:'/ir/secure/api/auditmanagement/assay/getAuditDetails' + "?assayId=" + assay.toJSON().id
			}, AuditTrailView);			
	    }

    });

    return AssayOverviewPageView;
});
