/*global define:false*/
define([ 'jquery',
         'underscore',
         'backbone',
         'views/ParentView',
         'views/assay/managePlannedRunsGridView',
         'views/assay/plannedRunsDetailsView',
         'views/assay/confirmDeletePlanModalView',
         'views/common/confirmModalView',
         'views/assay/planAddView',
         'views/viewNotes',
         'views/addNotesView',
         'views/common/bannersView',
         'views/common/searchView',
         'views/common/baseModalView',
         'views/common/auditReasonView',
		 'views/common/auditTrailView',
         'collections/assay/assays',
         'hb!templates/assay/planned-runs-overview.html'],
    function($,
    		_,
    		Backbone,
    		ParentView,
    		PlannedRunsGridView,
    		PlannedRunDetailsView,
    		ConfirmDeletePlans,
    		Confirm,
    		PlanAddView,
    		ViewNotes,
    		AddNotesView,
    		BannerView,
    		SearchView,
    		BaseModalView,
    		AuditReasonView,
			AuditTrailView,
    		Assays,
    		template) {
        'use strict';

        /**
         * Plan run overview page
         *
         * @type {*}
         */
        var PlanRunOverview =  ParentView.extend({

            _template: template,

            _gridEl: '#viewPlannedRuns-grid',

            _searchEl: '#query-form',

            initialize: function(options) {
                options = options || {};
                this.needsReason = options.auditConfig['Planned Runs'].needsReason;
                this.searchView = new SearchView({
                	placeHolder: 'data.results.plannedName'
                });
                this.searchView.on('search', this._onSearch, this);
    			this.searchView.on('reset', this._onReset, this);
                this._totalSaved = options.totalSaved;
                this._totalInvalid = options.totalInvalid;
                this._importInitiated = options.importInitiated;
                this.gridView = new PlannedRunsGridView();
                this.gridView.on('multiSelect', this._onGridMultiSelect, this);
				this.gridView.on('action:plan-review', this._showDetails, this);
				this.gridView.on('action:plan-edit', this._onEdit, this);
				this.gridView.on('action:execute', this._executePlan, this);
				this.gridView.on('action:view-notes', this._viewNotes, this);
				this.gridView.on('action:add-note', this._onAddNote, this);
				this.gridView.on('action:audit_trail', this._onAudit, this);
				this.gridView.addFilter('show', "all");
				this.gridView.addFilter('planName', "");
				this.assays = new Assays();
				this.assays.fetch();
            },

            events: {
            	'click #planRunAddBtn': '_onOpenAddPlan',
                'click #planRunDelete' : '_onDelete',
                'click div#filterGroup > button' : '_filterGridData'
            },

            render: function() {
                this.$el.html(this._template({defineActions : this.options.defineActions }));
                this.gridView.setElement(this.$(this._gridEl)).render();
                this.renderSubView(this.searchView, this._searchEl);
            },

		    _showDetails: function(e, plan){
		    	var self= this;
		    	BaseModalView.open(null, {
		    		plan: plan.toJSON(),
                    showEdit: false
		    	}, PlannedRunDetailsView);
            },

            _onEdit: function(e, plan){
		    	var self= this;
		    	BaseModalView.open(null, {
		    		plan: plan.toJSON(),
                    isEdit: true,
                    needsReason:this.needsReason,
                    grid:this.gridView
		    	}, PlannedRunDetailsView);
            },

		    _executePlan: function(e, plan) {
		    	var self= this;
		    	BaseModalView.open(null, {
		    		plan: plan.toJSON(),
	                grid : this.gridView,
	                isExecute: true,
	                needsReason:this.needsReason,
	                onComplete: function(){ self._onCompleteFunc('plan.execute.success'); }
		    	}, PlannedRunDetailsView);
		    },

            _onGridMultiSelect: function(plans) {
                $("#plannedRunsCount").html(plans.length);
                if (plans.length > 0) {
                    this.$('#planRunDelete').removeAttr('disabled');
                } else {
                    this.$('#planRunDelete').attr('disabled', 'disabled');
                }
            },

            _onAddNote: function(e, model) {
    			var self = this;
    			BaseModalView.open(null, {
    				el: "#addNotes",
    				entityId: model.toJSON().id,
    				entity: 'planrun',
    				onComplete: function(){ self._onCompleteFunc('specimen.add.notes.success'); }
    			},AddNotesView);
    		},

    		_viewNotes: function(e, model) {
    			var self = this;
    			BaseModalView.open(null, {
    				el: "#viewNotes",
    				entityId: model.toJSON().id,
    				entity: 'planrun',
    				url: '/ir/secure/api/planrun/notes?expId=' + model.toJSON().id
    			}, ViewNotes);
    		},
            _onAudit: function(e, model){
				var data=[];
				var temp={};
				temp.key="audit.trail.plannedrunshortcode";
				temp.value=model.attributes.planShortId;
				data.push(temp);
				var self = this;
				BaseModalView.open(null, {
					type: "audit_trail",
					el: "#auditTrailModal",
					model:model,
					data:data,
					gridViewUrl:'/ir/secure/api/auditmanagement/plannedruns',
					filters:{plannedrunsId : model.toJSON().id},
					detailsViewUrl:'/ir/secure/api/auditmanagement/plannedruns/getAuditDetails' + "?plannedrunsId=" + model.toJSON().id
				}, AuditTrailView);
			},
            _onDelete: function() {
                var plans = this.gridView.getSelected().toJSON();
                var canDelete = plans;
                var options = {};
				if(canDelete && canDelete.length > 0) {
				    options.canDelete = canDelete;
				}
				options.needsReason = this.needsReason;
				options.confirmMessageKey='planRun.delete.message';
                var self = this;
                Confirm.open(function() {
                	//AuditReasonView.open(function(){
                		var data={};
	                    var ids = [];
	                    for(var i = 0, len = canDelete.length; i<len; i++){
	                        ids.push(plans[i].id);
	                    }
	                    data.ids=ids;
	                    var reasonEl = arguments[0].$el.find('#reason-for-change');
	                    if(reasonEl.length > 0){
	                        data.reason = reasonEl.val();
	                    }
	                    $.ajax({
		                 	url: '/ir/secure/api/planrun/deleteplanruns',
		                 	type: 'POST',
		                 	contentType: 'application/json',
		                 	data: JSON.stringify(data),
		                 	success: function() {
		                 		self._onCompleteFunc('plan.delete.success')
					     		self.gridView.getSelected().models=[];
					     		self.gridView.getSelected().length=0;
					     		self._onGridMultiSelect([]);
		                 	    self.gridView.refresh();
		                    }
	                    });
                	//});
                }, options, ConfirmDeletePlans);
            },

            delegateEvents: function() {
                Backbone.View.prototype.delegateEvents.apply(this, arguments);
            },

            _onOpenAddPlan: function() {
            	var self= this;
            	BaseModalView.open(null, {
            		el: '#addPlan',
	                assays: self.assays.toJSON(),
	                reason: self.needsReason,
	                onComplete: function(){ self._onCompleteFunc('plan.add.success'); }
	            },PlanAddView);
            },

            _filterGridData: function(e) {
            	$(e.currentTarget).parent().find('.btn-pressed').removeClass('btn-pressed');
            	$(e.currentTarget).addClass('btn-pressed');
            	this.gridView._filters["show"] = $(e.currentTarget).attr('val').trim();
            	this.gridView._filters["planName"] = "";
            	$("#query-form > input").val("");
            	this.gridView.refresh();
            },

            _onSearch: function(query) {
                this.gridView.addFilter('planName', query);
                this.gridView.$el.data('kendoGrid').dataSource.page(1);
            },

		    _onReset: function() {
	            this.gridView.addFilter('planName', "");
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
	        }
        });

        return PlanRunOverview;
    }
);
