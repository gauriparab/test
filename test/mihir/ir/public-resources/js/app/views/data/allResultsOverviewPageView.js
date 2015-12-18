/* global define:false*/
define([
    'views/ParentView',
    'views/data/allResultsGridView',
    'views/data/reanalyzeRunView',
    'views/addNotesView',
    'views/viewNotes',
    'views/common/baseModalView',
    'views/assay/plannedRunsDetailsView',
    'models/data/specimen',
    'views/samples/specimenDetailsView',
    'views/common/bannersView',
    'views/assay/assayDetailView',
    'views/common/auditTrailView',
    'views/data/confirmRestoreView',
    'events/eventDispatcher',
    'hb!templates/data/all-results-overview-page.html'
],
    function(
    	ParentView,
        AllResultsGridView,
        ReanalyzeRunView,
		AddNotesView,
        ViewNotes,
        BaseModalView,
        PlannedRunDetailsView,
        SpecimenModel,
        SpecimenDetailsView,
        BannerView,
        AssayDetailView,
        AuditTrailView,
        ConfirmRestoreView,
        dispatcher,
        template) {
	'use strict';

    /**
     * Reanalysis Assay overview page
     *
     * @type {*}
     */
    var AllResultsView = ParentView.extend({

        _template: template,
        _gridEl: '#viewresults-grid',

        initialize: function(options) {
            options = options || {};
	
            this.gridView = new AllResultsGridView({
            	assayId : options.assayId,
            	specimenId : options.specimenId
            });
            this.gridView.on('action:view_plannedRun', this._showPlanDetails, this);
            this.gridView.on('action:view_reanalyze', this._showReanalyze, this);
            this.gridView.on('action:view_csa', this._csa, this);
            this.gridView.on('action:view_assayDetails', this._showAssayDetails, this);
            this.gridView.on('action:view_results', this._showResults, this);
            this.gridView.on('action:add_note', this._onAddNote, this);
            this.gridView.on('action:view-notes', this._viewNotes, this);
            this.gridView.on('action:view_clinicalReport', this._viewClinicalReport, this);
            this.gridView.on('action:view_labReport', this._viewLabReport, this);
            this.gridView.on('action:audit_trail', this._viewAuditTrail, this);
            this.gridView.on('action:restore', this._onRestore, this);
            
            dispatcher.on('restoration:complete', this._onCompleteFunc, this);
        },
        
        events: {
			'click #btnShowSpecimen' : '_onOpenShowSpecimen',
			'click #btnResultRefresh' : '_onRefresh'
		},

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
        },

        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
            this.$el.html(this._template({
            	specimenName: this.options.specimenName
            }));
            this.gridView.setElement(this.$(this._gridEl)).render();
        },
        
        _onOpenShowSpecimen: function(e, model) {
        	var specimenId = this.options.specimenId;
   			this.specimenModel = new SpecimenModel({
   				id : specimenId
   			});
   			var self = this;
   			$.when(this.specimenModel.fetch()).done(function(){
   				BaseModalView.open(null, {
   					el: "#viewSpecimen",
   					model: self.specimenModel
   				}, SpecimenDetailsView);
			});
		},
		
		_showPlanDetails: function(e, data){
			var plan = {};
			plan.verificationRuns = false;
			plan.id = data.get('planRun').id;
			plan.assayId = data.get('assay').id;
	    	var self= this;
	    	BaseModalView.open(null, {
	    		plan: plan,
                showEdit: false
	    	}, PlannedRunDetailsView);
        },

        _showReanalyze: function(e, raw) {
		    BaseModalView.open(null, {
                el: "#reanalysisDialog",
                assayId: raw.get('assay').id,
		    	resultId: raw.get('resultId'),
		    	grid: this.gridView
            }, ReanalyzeRunView);
		},
   		
		_showAssayDetails: function(e, assay) {
	    	var self = this;
            BaseModalView.open(null, {
                el: "#viewAssayDetails",
                assayId : assay.get('assay').id
            }, AssayDetailView);
   		},

   		_showResults: function(e, result) {
   			window.location = "/ir/secure/review-results/" + result.get('resultId');
   		},
   		
   		_onAddNote: function(e, model) {
			var self = this;
			BaseModalView.open(null, {
				el: "#addNotes",
				entityId:  model.toJSON().resultId,
				entity: 'data',
				onComplete: function(){ self._onCompleteFunc('specimen.add.notes.success'); }
			},AddNotesView);
		},
		
		_viewNotes: function(e, model) {
			var self = this;
			BaseModalView.open(null, {
				el: "#viewNotes",
				entityId: model.toJSON().resultId,
				entity: 'data',
				url: '/ir/secure/api/data/notes?resultId=' + model.toJSON().resultId
			}, ViewNotes);
		},
		
		_onRefresh: function(){
			this.gridView.refresh();
		},
		
		_viewClinicalReport: function(e, result){
			window.location.href = "/ir/secure/api/report/download?id=" + result.get('resultId')+"&downloadType=Clinical";
		},
		
		_viewLabReport: function(e, result){
			window.location.href = "/ir/secure/api/report/download?id=" + result.get('resultId')+"&downloadType=Analytical";
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
        _viewAuditTrail:function(e, model){
        	console.log(model);
			//temp.key="audit.trail.specimenid";
			var _model = model.toJSON();
			var that = this;
			BaseModalView.open(null, {
				type: "audit_trail",
				el: "#auditTrailModal",
				model:model,
				gridViewUrl:'/ir/secure/api/auditmanagement/planbyresult',
				filters:{resultId : _model.resultId},
				detailsViewUrl:'/ir/secure/api/auditmanagement/plannedruns/getAuditDetails' + "?plannedrunsId=" + _model.planRun.id
			}, AuditTrailView);	
        },
        _csa : function(e, result){
			window.location.href = "/ir/secure/api/data/csa?resultId=" + result.get('resultId');
		},
		
		_onRestore: function(e, model) {
			var self = this;
			BaseModalView.open(null, {
                el: "#restoreView",
                model: model
            }, ConfirmRestoreView);
			
		}
	
    });

    return AllResultsView;
});
