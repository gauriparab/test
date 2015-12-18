/*global define:false*/
define([ 'jquery', 
         'underscore', 
         'backbone', 
         'views/data/verificationRunsGrid', 
         'views/common/bannersView', 
         'views/assay/plannedRunsDetailsView',
         'views/common/baseModalView',
         'views/data/otDetailsView',
         'views/data/pgmDetailsView',
         'views/data/confirmRestoreView',
         'views/common/auditTrailView',
         'events/eventDispatcher',
         'hb!templates/data/verification-run-overview.html'],
    function($, 
    		_, 
    		Backbone, 
    		VerificationRunsGrid, 
    		BannerView,
    		PlannedRunDetailsView,
    		BaseModalView,
            OTDetailsView,
            PGMDetailsView,
            ConfirmRestoreView,
            AuditTrailView,
            dispatcher,
    		template) {
        'use strict';

        /**
         * Sample overview page
         *
         * @type {*}
         */
        var verificationRunsView = Backbone.View.extend({

            _template: template,

            _gridEl: '#verification-runs-grid',

            initialize: function(options) {
                this.gridView = new VerificationRunsGrid();
            },

            render: function() {
                this.$el.html(this._template({defineActions : this.options.defineActions }));
                this.gridView.setElement(this.$(this._gridEl)).render();
                this.gridView.on('action:view_report', this._onViewReport, this);
                this.gridView.on('action:view_csa', this._csa, this);
                this.gridView.on('action:view_plannedRun', this._showPlanDetails, this);
                this.gridView.on('action:view_otDetails', this._showOTDetails, this);  
                this.gridView.on('action:view_pgmDetails', this._showPGMDetails, this);
                this.gridView.on('action:restore', this._onRestore, this);
                this.gridView.on('action:audit_trail', this._viewAuditTrail, this);
                dispatcher.on('restoration:complete', this._onCompleteFunc, this);
                
            },
            
            delegateEvents: function() {
                Backbone.View.prototype.delegateEvents.apply(this, arguments);
            },

		    _onViewReport: function(e, verificationRun) {
				window.location = "/ir/secure/verification/runs/review/" + verificationRun.toJSON().results.id;
		    },
		
            _showPlanDetails: function(e, data){
    			var plan = {};
    			plan.verificationRuns = true;
    			plan.id = data.get('plannedRun').id;
    			//plan.assayId = data.get('assay').id;
    	    	var self= this;
    	    	BaseModalView.open(null, {
    	    		plan: plan,
                    showEdit: false
    	    	}, PlannedRunDetailsView);
            },
            
       		_showOTDetails: function(e, otData) {
    	    	BaseModalView.open(null, {
                    el: "#otDetailsModal",
                    otId: otData.get("results").id
                }, OTDetailsView);
    	    	
       		},
       		
       		_showPGMDetails: function(e, pgmData) {
    	    	BaseModalView.open(null, {
                    el: "#pgmDetailsModal",
                    pgmId: pgmData.get("results").id
                }, PGMDetailsView);
       		},
       		_csa : function(e, verificationRun){
    			window.location.href = "/ir/secure/api/data/csa?resultId=" +  verificationRun.toJSON().results.id;
    		},
    		
    		_onCompleteFunc: function(messageKey) {
                new BannerView({
                    container: this.$('.container-fluid').first(),
                    style: 'success',
                    titleKey: messageKey
                }).render();
                if(this.gridView) {
                	this.gridView.refresh();
                }
            },
    		
    		_onRestore: function(e, model) {
    			var self = this;
    			BaseModalView.open(null, {
                    el: "#restoreView",
                    model: model
                }, ConfirmRestoreView);
    			
    		},
    		
    		_viewAuditTrail:function(e, model){
    			var _model = model.toJSON();
    			var that = this;
    			BaseModalView.open(null, {
    				type: "audit_trail",
    				el: "#auditTrailModal",
    				model:model,
    				gridViewUrl:'/ir/secure/api/auditmanagement/planbyresult',
    				filters:{resultId : _model.results.id},
    				detailsViewUrl:'/ir/secure/api/auditmanagement/plannedruns/getAuditDetails' + "?plannedrunsId=" + _model.plannedRun.id
    			}, AuditTrailView);	
            }

            
        });

        return verificationRunsView;
    }
);
