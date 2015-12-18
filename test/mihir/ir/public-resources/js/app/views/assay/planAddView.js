/*global define:false*/
define(['views/common/baseModalView', 
        'models/assay/planRunModel',
        'views/assay/planAddLibraryGrid',
        'views/assay/addLibraryView',
        'views/assay/controlsView',
        'events/eventDispatcher',
        'hb!templates/assay/add-new-plan.html', 
        'hb!templates/common/confirm-modal-footer.html'
].concat('views/common/grid/plugins/rowSelectionGridPlugin',
		 'views/common/grid/plugins/actionsGridPlugin',
       	 'views/common/grid/plugins/multiSelectionGridPlugin'),
    function(BaseModalView, 
    		 PlanModel,
    		 PlanAddLibraryGridView,
    		 AddLibraryView,
    		 ControlsView,
    		 Dispatcher,
    		 bodyTemplate,
             footerTemplate) {
        'use strict';
        var PlanAddView = BaseModalView.extend({
                        
            _options: function() {
    			return {
    				bodyTemplate: bodyTemplate,
    				headerKey: 'planrun.add.label',
    				assays: this.options.assays,
    				modalOptions : {
                        backdrop: 'static',
                        attentionAnimation: null,
                        keyboard: false,
                        show : true
                    }
    			}
    		},

            initialize: function(options) {
                options = options || {};
                this.initializeModel(options);
                this.options.needsReason = options.reason;
                BaseModalView.prototype.initialize.call(this, options);
                if(options.data)
                	this.controls=options.data.planRunControlDtos;
                this.gridView = new PlanAddLibraryGridView();
                this.gridView.loadPlugin('actions');
                this.gridView.loadPlugin('rowSelection');
                this.gridView.loadPlugin('multiSelection');
                
                Dispatcher.on('change:libCount', this._changeLibraryCount, this);
            },
             
            initializeModel: function(options) {
                this.model = this.model || new PlanModel();
                this.completeAction = options.onComplete;
            },
            
            events: {
                'click #btnSavePlan' : 'save',
                'click #btnCancelPlan' : '_hide',
                'click #addPlanLibrary' : '_addLibrary',
                'click #removePlanLibrary' : '_removeLibrary',
                'change #planRunAssay' : '_selectAssay'
            },
            
            render: function() {
            	BaseModalView.prototype.render.call(this);
            	//this._renderGridForAssay($("#planRunAssay").val());
            	this.renderSubView(this.gridView, "#plan-run-libraryGrid");
            	if(this.options.data) {
	            	var gridData= this.options.data.selectedLibraries;
	            	var self=this;
	            	_.each(this.controls, function(controlDto){
	            		var control=controlDto;
	            		control.specimenId= "NA";
	            		control.libraries=[];
	            		var library={
	            				libraryType: controlDto.name,
	            				barcode: controlDto.barcodeDto,
	            				libraryName: controlDto.controlType+'_'+self.options.data.batchId
	            		}
	            		control.libraries.push(library);
	            		//control.batchId= self.options.data.batchId;
	            		gridData.push(control);
	            	});
	            	this.gridView.$el.data('kendoGrid').dataSource.data(gridData);
	            	var checkboxes= this.gridView.$el.find('table tbody tr td:first-child :checkbox');
	            	if(this.controls)
		            	for(var i=(checkboxes.length-1); i>(checkboxes.length-this.controls.length-1); i--) {
		            		checkboxes[i].disabled=true;
		            	}
	            	var libCount = 0;
	            	_.each(this.options.data.selectedLibraries, function(e) { 
	            		if(e.specimenId !== 'NA') {
	            			libCount += e.libraries.length;
	            		}
	            	});
	            	$("#libraryCount").html(libCount);
            	}
                this.$('#modalFooter').html(footerTemplate({
                	confirmClass: 'btn-primary',
                	cancelClass: 'btn-default',
                	cancelKey: 'dialog.cancel',
                	confirmKey: 'dialog.save',
                	confirmId: 'btnSavePlan',
                	cancelId: 'btnCancelPlan'
                }));
                
                this.gridView.on('multiSelect', this._onGridMultiSelect, this);
                
                this.$('#addPlanForm input').on('keypress',function(e){
                    if((e.keyCode ? e.keyCode : e.which) == 13) {
                    	e.preventDefault();
                    }
                });
                
                this.$el.find("span[data-toggle='tooltip']").on('hidden', function(e){
                	e.stopPropagation();
                });
                
                if(!this.options.reportTemplateRequired){
                	$("#reportTemplatesSection").hide();
                } else {
                	$("#reportTemplatesSection").show();
                }
                
    			return this;
    		},
    		
    		delegateEvents: function() {
    			BaseModalView.prototype.delegateEvents.apply(this, arguments);
    			this.$el.on('hidden', _.bind(this.onHide, this));
            },
    		
            save: function() {
            	this.disableButton();
            	this.model.unset('reason');
		        this.model.set('assayId',(this.options.assayId ? this.options.assayId: $("#planRunAssay").attr('value'))); 
		        this.model.set('planName', $("#planARunName").val());
		        this.model.set('RdxReportTemplateId', $("#reportTemplates").val());
		        this.model.set('note', $("#planARunNote").val());
		        var allControls= [];
                if(this.gridView.$el.data('kendoGrid')) {
                	var planRunLibraryprepDtoList= this.gridView.$el.data('kendoGrid').dataSource.data().toJSON();
                	_.each(planRunLibraryprepDtoList, function(lib) {
                		if(lib.specimenId === 'NA'){
                			allControls.push(lib);
                		}else{
                			lib.specimenId = lib.specimenTechId;
                		}
                	});
                	var index= planRunLibraryprepDtoList.length-allControls.length;
                	planRunLibraryprepDtoList.splice(index, allControls.length);
                	this.model.set('planRunLibraryprepDtoList', planRunLibraryprepDtoList);
                }
                this.model.set('planRunControlDtoList', allControls);
                var reason = this.$el.find('#reason-for-change').val();
                this.model.set('reason',reason);
                this.model.save(this.model.toJSON(), {
                    success: _.bind(this._onSaveSuccess, this),
                    error: _.bind(this.enableButton, this)
                });
            },
            
            _onGridMultiSelect: function(data){
            	if(data.length > 0){
            		$('a#removePlanLibrary').removeClass('no-follow');
            	} else{
            		$('a#removePlanLibrary').addClass('no-follow');
            	}
            	//console.log(data);
            },
            
            _onSaveSuccess: function(model, response) {
                this.closeDialog();
                if (_.isFunction(this.completeAction)) {
                    this.completeAction(response);
                }
            },

            closeDialog: function() {
            	var self = this;
            	this.$el.unbind('hide').on('hide', function () {
            		self.undelegateEvents();
	                self.unbind();
	            });
                this.$el.modal('hide');
            },
            
            _addLibrary: function() {
            	BaseModalView.open(null, {
                    el: "#addLibraryModal",
                    grid: this.gridView
                }, AddLibraryView);
            },
            
            _removeLibrary : function() {
				var libraries = this.gridView.$el.data('kendoGrid').dataSource.data().toJSON();
				var selectedLibraries = this.gridView.getSelected();
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
				$("#libraryCount").html(libCount);
				if(libCount === 0){
					$('a#removePlanLibrary').addClass('no-follow');
					libraries = [];
            	}
				this.gridView.$el.data('kendoGrid').dataSource.data(libraries);
				
				var checkboxes= this.gridView.$el.find('table tbody tr td:first-child :checkbox');
				var controls=_.filter(libraries, function(lib){
					return lib.specimenId === 'NA';
				})
            	if(controls)
	            for(var i=(checkboxes.length-1); i>(checkboxes.length-controls.length-1); i--) {
	            	checkboxes[i].disabled=true;
	            }
			},
			
			_selectAssay: function(e){
				this._renderGridForAssay($(e.currentTarget).val());
			},
			
			_renderGridForAssay: function(assayId) {
    			this.gridView.addFilter('assayId',assayId);
			},
			
			_changeLibraryCount: function(libCount) {
            	$("#libraryCount").html(libCount);
            }
        });

        return PlanAddView;
    });
