/*global define:false*/
define(['views/common/baseModalView',
		'models/assay/planRunModel',
		'views/errorsView',
		'views/assay/plannedReviewLibrariesGrid',
		'views/assay/controlsView',
		'views/assay/addLibraryView',
		'events/eventDispatcher',
		'hb!templates/assay/planned-runs-review.html',
		'hb!templates/assay/plan-run-footer.html'].concat('bootstrap','jBarcode', 'views/common/grid/plugins/multiSelectionGridPlugin'),
	function(BaseModalView, 
			PlanRunModel, 
			ErrorsView, 
			PlannedRunLibrariesGrid,
			ControlsView,
			AddLibraryView, 
			Dispatcher,
			bodyTemplate, 
			footerTemplate) {
			'use strict';
			var PlanARun = BaseModalView.extend({

				el : '#planARunDetailsModal',
				
				_options: function() {
	    			return {
	    				bodyTemplate: bodyTemplate,
	    				headerKey: this.headerKey,
	    				isExecute : this.options.isExecute,
						showEdit : this.options.showEdit,
						isEdit : this.options.isEdit,
	    				modalOptions : {
	                        backdrop: 'static',
	                        attentionAnimation: null,
	                        keyboard: false,
	                        show : true
	                    }
	    			}
	    		},
	    		
	    		getReason: function(){
	    			return this.r;
	    		},
	    		
	    		setReason: function(r){
	    			this.r = r;
	    		},
	    		

				initialize : function(options) {
					options = options || {};
					
					if(!options.plan.verificationRuns) {
						this.plannedRunLibrariesGrid = new PlannedRunLibrariesGrid({
							planId : options.plan.id,
							assayId : options.plan.assayId
						});
						this.model = new PlanRunModel({
							planId : options.plan.id
						});
					} else{
						this.model = new PlanRunModel({
							planId : options.plan.id,
							updateUrl : "/ir/secure/api/installTemplate/executePlan"
						});
						this.options.showEdit = false;
					}
					
					if (options.isExecute) {
						this.el = '#planARunExecuteModel';
						this.options.headerKey ='planned.runs.execute.title';
						this.options.needsReason = options.needsReason;
					}
					else {
						this.options.headerKey ='planned.runs.review.title';
					}
					this.setReason(options.needsReason);
					this.grid= options.grid;
					BaseModalView.prototype.initialize.call(this, options);
					var self = this;
					this.options.isEdit = false;
					if(options.isEdit) {
						this.edit();
					}
					
					Dispatcher.on('change:libCount', this._changeLibraryCount, this);
				},

				render : function() {
					var self = this;
					this.model.fetch({
	                    contentType: "application/json;charset=UTF-8",
	                    success: _.bind(this._finalizeRender, this)
	                });
					
					return this;
				},
				
				_finalizeRender: function(){
					var that = this;
					var controls = this.model.toJSON().planRunControlDtoList;
					var internalControls = _.filter(controls, function(control) { return control.controlType === "internalControl";});
					var positiveControls = _.filter(controls, function(control) { return control.controlType === "kit";});
					positiveControls = _.sortBy(positiveControls, function(positiveControl) { return positiveControl.id;});
					internalControls = _.sortBy(internalControls, function(internalControl) { return internalControl.id;});
					controls = _.union(positiveControls, internalControls);
					this.model.set("planRunControlDtoList", controls);
					BaseModalView.prototype.render.call(this);
					 this.$('#modalFooter').html(footerTemplate({
						 isExecute : this.options.isExecute,
						 isEdit : this.options.isEdit,
						 showEdit : false
			         }));
					 this.noOfLibraries = 0;
					 $("#noOfLibraries").html(this.model.toJSON().noOfLibraries);
					 $("#barcodeLable").barcode($("#barcodeLable").text().trim(), "code128", {	barWidth : 2, barHeight : 30 });
					 $("#barcodeLable > div:first").remove();
					 $("#barcodeLable > div:nth-last-child(2)").remove();
					 $("#barcodeLable").width($("#barcodeLable").width() - 40);
					 if(!this.options.plan.verificationRuns) {
						this.renderSubView(this.plannedRunLibrariesGrid, "#viewPlanRunLibrariesSamples-grid");
						this.batchId = this.model.toJSON().planRunLibraryprepDtoList[0].batchId;
						this.$el.find("#removeLibrary").addClass("no-follow");						
					 }
					 this.$el.find("span[data-toggle='tooltip']").on('hidden', function(e){
		                	e.stopPropagation();
		             });
				},

				events : {
					'click button#planRunSave' : 'save',
					'click button#planRunReview' : 'review',
					'click button#planRunEditButton' : 'edit',
					'click button#planRunPrintButton':'print',
					'click a#addLibrary' : 'addLibrary',
					'click a#removeLibrary' : 'removeLibrary',
					'click button#planRunEditSave' : 'update',
					'click #planRunCancelButton' : '_hide'
				},
								
				save : function() {
					this.disableButton();
					var self = this;
					if(!this.options.plan.verificationRuns){
						this.model.set("tubeLabel", $("#tubeLabel").val());
					}
					this.model.set("barcode", $("#templatePrepKit").val());
					
					var reasonEl = this.$el.find('#reason-for-change');
					var reason;
					if(reasonEl.length > 0) {
						reason=reasonEl.val();
					}
					this.model.set('reason',reason);
					
					this.model.save(null, {
						success : function() {
							if(!self.options.plan.verificationRuns){
								self.plannedRunLibrariesGrid.refresh();
							}
							self.options.isExecute = false;
							self.options.headerKey ='planned.runs.review.title';
							self.options.needsReason = false;
							BaseModalView.prototype.initialize.call(self, self.options);
							self.grid.refresh();
							self.render();
						},
						error: _.bind(self.enableButton, self)
					});
				},

				review : function() {
					this.options.isExecute = false;
					this.options.headerKey ='planned.runs.review.title';
					this.options.needsReason = false;
					if(!this.options.plan.verificationRuns){
						this.options.showEdit = true;
					}
					BaseModalView.prototype.initialize.call(this, this.options);
					this.render();
				},
				
				edit: function() {
					this.options.isEdit = true;
					this.options.headerKey ='planned.runs.edit.title'
					if(!this.options.plan.verificationRuns){
						this.plannedRunLibrariesGrid = new PlannedRunLibrariesGrid({
							planId : this.options.plan.id,
							assayId : this.options.plan.assayId
						});
						this.model = new PlanRunModel({
							planId : this.options.plan.id,
							isEdit : true
						});
						this.plannedRunLibrariesGrid.loadPlugin('multiSelection');
						this.plannedRunLibrariesGrid.on('multiSelect', this._onGridMultiSelect, this);
					} else{
						this.model = new PlanRunModel({
							planId : this.options.plan.id,
							isEdit : true,
							updateUrl : "/ir/secure/api/installTemplate/executePlan"							
						});
					}
					this.options.needsReason = this.getReason();
					BaseModalView.prototype.initialize.call(this, this.options);
					this.render();
				},
				
				print:function(){
					var that = this;
					
					var _model = this.model.toJSON();
					
					var html = '<html><head>';
					html+='<style>@media print {table {-webkit-print-color-adjust: exact; }hr{background:black;color:black;}}table {width:100%}table tbody tr{background:#f5f5f5;width:100%;}table tbody tr:nth-child(even){background:white;}table tbody tr td{width:25%;padding: 5px 0px 5px 10px;}table thead tr th{text-align:left;}table thead tr{border-bottom: 2px solid black;}</style>';
					html+='</head><body>';
					html+='<div><h4>'+this.$('#plan_name').html()+'</h4></div>';
					html+='<div><table><tbody>';
					html+='<tr><td>'+$.t('planned.runs.assay')+'</td><td>'+_model.assayName+'</td></tr>';
					html+='<tr><td>'+$.t('planned.runs.runShortCode')+'/ Barcode</td><td><div style="margin-top:5px; width:180px;">'+this.$('#barcodeLable').html()+'</div></td></tr>';
					if(this.model.get("templateType") != "install_ws" && this.model.get("templateType") != "install_pgm"){
						html+='<tr><td>'+$.t('planned.runs.tubeLabel')+'</td><td>'+(_model.tubeLabel ? _model.tubeLabel:'')+'</td></tr>';
					}
					if(this.model.get("templateType") != "install_pgm"){
						html+='<tr><td>'+$.t('planned.runs.templatePrepKit')+'</td><td>'+(_model.templatKitBarcode?_model.templatKitBarcode:'')+'</td></tr>';
					}
					html+='</tbody><table></div>';
					html+='<hr/>';
					if(this.model.get("templateType") != "install_ws" && this.model.get("templateType") != "install_pgm"){
						html+='<div><h4><b>'+$.t('planned.grid.noOfSampleLibraries')+' - '+ this.$("#noOfLibraries").html() +'</b></h4></div>';
						html+='<div>';
						html+=this.$('#viewPlanRunLibrariesSamples-grid').html();
						html+='</div>';
					}
					html += '</body></html>';
					var printWindow = window.open();
                    if (!printWindow) {
                        alert("Please allow pop-ups");
                    } else {
                        printWindow.document.write(html);
                        printWindow.print();
                        printWindow.close();
                    }
					
				},
				
				_onGridMultiSelect: function(samples) {
	            	this.selectedSamples = samples;
	            	if(samples.length > 0){
	            		this.$el.find("#removeLibrary").removeClass("no-follow");
	            	}else{
	            		this.$el.find("#removeLibrary").addClass("no-follow");
	            	}
	            },
				
				addLibrary : function(e) {
					e.preventDefault();
					BaseModalView.open(null, {
	                    el: "#addLibraryModal",
	                    grid: this.plannedRunLibrariesGrid,
	                    batchId: this.batchId
	                }, AddLibraryView);
				},
				
				removeLibrary : function() {
					var libraries = this.plannedRunLibrariesGrid.$el.data('kendoGrid').dataSource.data().toJSON();
					var selectedLibraries = this.plannedRunLibrariesGrid.getSelected();
					var self = this;
					libraries = _.reject(libraries, function(lib){					
						var temp = _.filter(selectedLibraries.toJSON(), function(library){
							return library.id === lib.id;
						});
						if(temp.length){
							return true;
						}else{
							return false;
						}
					});
					var libCount = 0;
	            	_.each(libraries, function(e) { 
	            		if(e.batchId) {
	            			libCount += e.libraries.length;
	            		}
	            	});
	            	$("#noOfLibraries").html(libCount);
	            	if(libCount === 0){
                        libraries = [];
                        this.$el.find("#removeLibrary").addClass("no-follow");
	            	}
					this.plannedRunLibrariesGrid.$el.data('kendoGrid').dataSource.data(libraries);
				},
				
				update : function() {
					this.disableButton();
					var self = this;
					var executeDto = {};
					executeDto.expId = this.options.plan.id;
					executeDto.tubeLabel = $("#tubeLabel").val();
					this.model.set("planRunExecutionDto", executeDto);
					var runDto = {};
					runDto.id = this.options.plan.id;
					runDto.assayId = this.options.plan.assayId;
					runDto.planName = $("#planName").val();
					runDto.note = $("#notes").val();					
					if(!this.options.plan.verificationRuns){
						runDto.tubeLable = $("#tubeLabel").val();
						runDto.planRunLibraryprepDtoList = this.plannedRunLibrariesGrid.$el.data('kendoGrid').dataSource.data().toJSON();
					}
					this.model.set("planRunDto", runDto);
					var reason = this.$el.find('#reason-for-change').val();
        			this.model.set('reason',reason);
					this.model.save(null, {
						success : function() {
							self.$el.find('form#auditModalForm').remove();
							self.grid.refresh();
							if(!self.options.plan.verificationRuns){
								self.plannedRunLibrariesGrid = new PlannedRunLibrariesGrid({
									planId : self.options.plan.id,
									assayId : self.options.plan.assayId
								});
								self.model = new PlanRunModel({
									planId : self.options.plan.id
								});
								self.options.showEdit = true;	
							} else{
								self.model = new PlanRunModel({
									planId : self.options.plan.id,
									updateUrl : "/ir/secure/api/installTemplate/executePlan"
								});
							}
							
							self.options.isExecute = false;
							self.options.isEdit = false;	
							self.options.headerKey ='planned.runs.review.title';
							self.options.needsReason = false;
							BaseModalView.prototype.initialize.call(self, self.options);
							self.render();
						},
						error: _.bind(self.enableButton, self)
					});
				},
				
				delegateEvents: function() {
	    			BaseModalView.prototype.delegateEvents.apply(this, arguments);
	    			this.$el.on('hidden', _.bind(this.onHide, this));
	            },
	            
	            _changeLibraryCount: function(libCount) {
	            	$("#noOfLibraries").html(libCount);
	            }
			});

			return PlanARun;
		});
