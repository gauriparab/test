/*global define:false*/
define([ 'models/common/reasonModel',
         'models/sample/libraryBatch',
         'views/ParentView',
         'views/samples/libraryGridView',
         'views/samples/editSampleView',
         'views/common/confirmModalView',
         'views/common/bannersView',
         'views/samples/confirmDeleteSamplesModalView',
         'views/loadingView',
         'hb!templates/sample/manage-library-overview.html',
         'views/common/baseModalView',
         'views/common/auditTrailView',
         'collections/sample/barcodes',
         'views/common/searchView',
         'views/common/auditReasonView',
         'views/common/confirmDeleteModalView',
         'views/addNotesView',
         'views/assay/planAddView',
         'views/samples/prepareLibraryBatchView',
         'collections/assay/assays',
         'views/viewNotes',
		 'collections/sample/reportTemplates',
         ].concat('bootstrap'),
    function(ReasonModel,
    		LibraryBatchModel,
    		ParentView,
    		LibraryGridView,
    		EditSampleView,
    		Confirm,
    		BannerView,
    		ConfirmDeleteSamples,
    		LoadingView,
    		template,
    		BaseModalView,
    		AuditTrailView,
    		Barcodes,
    		SearchView,
    		AuditReasonView,
    		ConfirmDeleteModalView,
    		AddNotesView,
    		PlanAddView,
    		PrepareLibraryBatchView,
    		Assays,
    		ViewNotes,
			ReportTemplates) {
        'use strict';

        /**
         * Library overview page
         *
         * @type {*}
         */
        var libraryOverview = ParentView.extend({

            _template: template,

            _gridEl: '#library-grid',
            _searchEl: '#query-form',

            initialize: function(options) {
            	var that=this;
                options = options || {};
                this.needsReason = options.auditConfig['Libraries'].needsReason;
                this.needsReasonForRun = options.auditConfig['Planned Runs'].needsReason;
                this.gridView = new LibraryGridView();
                this.searchView = new SearchView({
                	placeHolder: 'grid.column.libraryName'
                });
                this.reportTemplates = {};

                this.barcodes = new Barcodes();
                this.assays = new Assays();
                this.searchView.on('search', this._onSearch, this);
    			this.searchView.on('reset', this._onReset, this);
                this.gridView.on('multiSelect', this._onGridMultiSelect, this);
                this.gridView.on('action:edit', this._onEditLibrary, this);
                this.gridView.on('action:edit_batch', this._onEditLibraryBatch, this);
                this.gridView.on('action:audit_trail', this._onAudit, this);
                this.gridView.on('action:audit_batch', this._onAuditBatch, this);
                //this.gridView.on('action:delete_batch', this._onDeleteBatch, this);
                this.gridView.on('action:add_notes', this._onAddNote, this);
    			this.gridView.on('action:view_notes', this._viewNotes, this);
    			this.gridView.addFilter('show', "all");
    			this.gridView.addFilter('libraryName', "");
    			this.barcodes.fetch();
    			this.assays.fetch();
            },
            events: {
                'click #libraryDelete' : '_onDelete',
                'click #libraryPlanARunBtn' : '_onPlanARun',
                'click div#filterGroup > button' : '_filterGridData',
            },

            render: function() {
                this.$el.html(this._template());
                this.renderSubView(this.searchView, this._searchEl);
                this.renderSubView(this.gridView, this._gridEl);
	        },

		    _onAudit: function(e, model){
				var data=[];
				var temp={};
				temp.key="audit.trail.libraryprepid";
				temp.value=model.toJSON().id;
				data.push(temp);
				var self = this;
				BaseModalView.open(null, {
					type: "audit_trail",
					el: "#auditTrailModal",
					model:model,
					data:data,
					gridViewUrl:'/ir/secure/api/auditmanagement/library',
					filters:{libraryId : model.toJSON().id},
					detailsViewUrl:'/ir/secure/api/auditmanagement/library/getAuditDetails' + "?libraryId=" + model.toJSON().id
				}, AuditTrailView);
		    },

		    _filterGridData: function(e) {
	        	$(e.currentTarget).parent().find('.btn-pressed').removeClass('btn-pressed');
	        	$(e.currentTarget).addClass('btn-pressed');
	        	this.gridView._filters["show"] = $(e.currentTarget).attr('val').trim();
	        	this.gridView._filters["libraryName"] = "";
	        	$("#query-form > input").val("");
	        	this.gridView.refresh();
	        },

            _onGridMultiSelect: function(library) {
            	var libCount=0;
            	_.each(library.toJSON(), function(e) {
            		libCount += e.libraries.length;
            	});
            	$("#libCount").html(libCount);
                if (library.length > 0) {
                    this.$('#libraryDelete').removeAttr('disabled');
                    this.$('#libraryPlanARunBtn').removeAttr('disabled');
                } else {
                	this.$('#libraryDelete').attr('disabled', 'disabled');
                    this.$('#libraryPlanARunBtn').attr('disabled', 'disabled');
                }
            },

    		_onSearch: function(query) {
                this.gridView.addFilter('libraryName', query);
                this.gridView.$el.data('kendoGrid').dataSource.page(1);
            },

		    _onReset: function() {
	            this.gridView.addFilter('libraryName', "");
	        },

            delegateEvents: function() {
                Backbone.View.prototype.delegateEvents.apply(this, arguments);
            },

		    _onPlanARun: function(e){
		    	var self= this;
				var batchIds = [];
				var selectedLibs = self.gridView.getSelected().toJSON();
				for(var lib in selectedLibs){
					batchIds.push(selectedLibs[lib].batchId);
				}
				var toBeSent = {
						batchIds: batchIds
				};
				$.ajax({
			        url: '/ir/secure/api/planrun/getPlanAddLibraries',
			        type: 'POST',
			        contentType: 'application/json',
			        dataType: 'json',
			        data: JSON.stringify(toBeSent),
			        success: function(data) {
							self.reportTemplates = new ReportTemplates({id:data.assayId});
							self.reportTemplates.fetch({
								success:function(){
									var gridData= {
											selectedLibraries: selectedLibs,
											planRunControlDtos: data.planRunControlDtos,
											batchId: data.batchId,
									}
									BaseModalView.open(null, {
										el: '#addPlan',
										assay: data.assayName,
										assayId: data.assayId,
										data:gridData,
										reason:self.needsReasonForRun,
										reports:self.reportTemplates.toJSON(),
										reportTemplateRequired:data.reportTemplateRequired,
										onComplete: function(){ window.location = "planned-runs.html" ;}
									},PlanAddView);

								}
							});
			        },
			        error: function(){
						console.log('getPlanAdd Failure');
					}
			    });

		    },

			_onAddNote: function(e, model) {
				var id = e.currentTarget.getAttribute('alt');
				var self = this;
				BaseModalView.open(null, {
					el: "#addNotes",
					entityId : id,
					entity : 'library',
					onComplete: function(){ self._onCompleteFunc('library.add.notes.success'); }
				},AddNotesView);
			},

			_viewNotes: function(e, model) {
				var id = e.currentTarget.getAttribute('alt');
				var self = this;
				BaseModalView.open(null, {
					el: "#viewNotes",
					entityId: id,
					entity: 'library',
					url: '/ir/secure/api/library/notes?libraryId=' + id
				}, ViewNotes);
			},

			_onDelete: function() {
	        	var self = this;
	        	ConfirmDeleteModalView.open(function(){
	        		//AuditReasonView.open(function(){
	        			var ids = _.pluck(self.gridView.getSelected().toJSON(), 'id');
	        			var data = {};
	        			data.ids = ids;
                		var reasonEl = arguments[0].$el.find('#reason-for-change');
                		if(reasonEl.length > 0) {
                			data.reason = reasonEl.val();
                		}
    	        	$.ajax({
	    	        		url: '/ir/secure/api/library/deleteLibraryprep',
	    	        		method: 'DELETE',
	    	        		contentType : 'application/json',
	    	        		data: JSON.stringify(data),
	    	        		success: function(){
	    	        			var checkboxes = self.gridView.$el.find('tbody tr td :checked');
	    	        			_.each(checkboxes, function(checkbox){
	    	        				$(checkbox).click();
	    	        			});
	    	        			self._onCompleteFunc('library.delete.success');
	    	        		}
	    	        	});
	        		//});
	        	}, {
	        		headerKey: 'library.delete.label',
	        		confirmMessageKey: 'library.delete.message',
	        		cancelClass: 'btn-default',
	        		confirmClass: 'btn-primary',
	        		needsReason:this.needsReason
	        	}, ConfirmDeleteModalView);
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

            _onEditLibraryBatch: function(e, model) {
            	var self=this;
    			BaseModalView.open(null, {
					type: "edit",
					el: "#addEditLibrary",
					onComplete: function(){ self._onCompleteFunc('libraryBatch.edit.success'); },
					needsRason:self.needsReason,
					assays: self.assays.toJSON(),
					data: model.toJSON(),
	                barcodes: self.barcodes.toJSON(),
				}, PrepareLibraryBatchView);
            },

            _onAuditBatch: function(e, model){
    			var data=[];
    			var temp={};
    			temp.key="grid.column.libraryBatchId";
    			temp.value=model.toJSON().batchId;
    			data.push(temp);
    			var self = this;
    			BaseModalView.open(null, {
    				type: "audit_trail",
    				el: "#auditTrailModal",
    				model:model,
    				data:data,
    				gridViewUrl:'/ir/secure/api/auditmanagement/library',
    				filters:{libraryId : model.toJSON().batchId},
    				detailsViewUrl:'/ir/secure/api/auditmanagement/library/getAuditDetails' + "?libraryId=" + model.toJSON().batchId
    			}, AuditTrailView);
    	    },

    	    _onDeleteBatch: function(e, model){
    			var self = this;
    			/*$.ajax({
	        		url: '/ir/secure/api/library/deleteLibraryprep',
	        		contentType : 'application/json',
	        		method: 'GET',
	        		success: function(){*/
	        			ConfirmDeleteModalView.open(function(){
		        			var ids = [model.toJSON().id]
		        			var data = {};
		        			data.ids = ids;
		    	        	$.ajax({
		    	        		url: '/ir/secure/api/library/deleteLibraryprep',
		    	        		method: 'DELETE',
		    	        		contentType : 'application/json',
		    	        		data: JSON.stringify(data),
		    	        		success: function(){
		    	        			self._onCompleteFunc('library.delete.success');
		    	        		}
		    	        	});
				        	}, {
				        		headerKey: 'library.delete.label',
				        		confirmMessageKey: 'library.delete.message',
				        		cancelClass: 'btn-default',
				        		confirmClass: 'btn-primary',
				        		needsReason:this.needsReason
				        	}, ConfirmDeleteModalView);
	        		/*}
	        	});*/
    	    }

        });

        return libraryOverview;
    }
);
