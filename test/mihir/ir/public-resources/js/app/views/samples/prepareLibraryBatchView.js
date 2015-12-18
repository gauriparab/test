/*global define:false*/
define(['models/sample/libraryBatch',
        'models/assay/assayModel',
        'collections/sample/barcodes',
        'views/common/baseModalView', 
        'views/samples/libraryBatchGrid',
        'views/samples/libraryPrepView',
        'events/eventDispatcher',
        'hb!templates/sample/prepare-library-batch-view.html', 
        'hb!templates/common/confirm-modal-footer.html',
        'hb!templates/common/spinner.html'],
    function(LibraryBatchModel,
    		 AssayModel,
    		 Barcodes,
    		 BaseModalView, 
    		 LibraryBatchGridView,
    		 LibraryPrepView,
    		 Dispatcher,
    		 bodyTemplate,
             footerTemplate,
             Spinner) {
        'use strict';
        var PrepareLibraryBatchView = BaseModalView.extend({
                        
            _options: function() {
    			return {
    				bodyTemplate: bodyTemplate,
    				headerKey: this.headerKey,
    				assays: this.options.assays,
    				modalOptions : {
                        backdrop: 'static',
                        attentionAnimation: null,
                        keyboard: false,
                        show : true,
                        width: '880px'
                    }
    			}
    		},

            initialize: function(options) {
                options = options || {};
                this.initializeModel(options);
                this.options.needsReason = options.needsRason;
                this.isEdit= (options.type == 'edit') ? true : false;
                this.options.headerKey=this.isEdit ? 'libraryBatch.edit.header' : 'specimen.libraryBatch.label'
                BaseModalView.prototype.initialize.call(this, options);
            },
             
            initializeModel: function(options) {
                this.model = this.model || new LibraryBatchModel({
                	id: options.data.batchId
                });
                this.completeAction = options.onComplete;
            },
            
            events: {
                'click #btnSaveLibraryBatch' : 'save',
                'click #btnCancelLibraryBatch' : '_hide',
                'change #libraryBatchAssay' : '_selectAssay'
            },
            
            render: function() {
            	var self=this;
            	if(this.isEdit) {
            		this.model.fetch({
            			success: function() {
            				self.assayId=self.model.toJSON().assayId;
            				self._renderDetails(self.assayId);
            			}
            		});
                	
                } else {
                	if(this.options.assays.length === 0) {
                		Dispatcher.trigger('fail:prepareLibBatch')
                	} else {
	                	this.assayId = this.options.assays[0].id;
	                	this._renderDetails(this.assayId);
                	}
                }
            	
    			return this;
    		},
    		
    		_renderDetails: function(assayId) {
    			var self=this;
    			this.assay= new AssayModel({id: assayId});
            	this.assay.fetch({
            		success: function(){
            			var kits= (self.assay.toJSON().applicationType == "DNA_RNA" || self.assay.toJSON().applicationType == "RNA") ? true : false;
            			self.options.libraryPrepType= self.assay.toJSON().application;
            			//self.options.isPanelKit= (self.assay.toJSON().applicationType == "DNA_RNA" || self.assay.toJSON().applicationType == "RNA") ? true : false;;
            			self.options.isPanelKit=(self.assay.toJSON().applicationType == "DNA" && self.assay.toJSON().applicationVersion.value == "IR36") ? false : true;
            			self.options.isControlsKit= kits;
            			//self.options.isCNVCalibrator=kits;
            			self.options.isCNVCalibrator=false; //disabled displaying CNV for now.
            			self.options.assayId=self.assayId;
            			BaseModalView.prototype.render.call(self);
            			self._renderGrid(assayId);
    	            	self.$('#modalFooter').html(footerTemplate({
    	                	confirmClass: 'btn-primary',
    	                	cancelClass: 'btn-default',
    	                	cancelKey: 'dialog.cancel',
    	                	confirmKey: 'dialog.save',
    	                	confirmId: 'btnSaveLibraryBatch',
    	                	cancelId: 'btnCancelLibraryBatch'
    	                }));    
    	            	self.$("#panelKitBarcode").focus();    	            	
            		}
            	});
    		},
    		
    		_renderGrid: function(assayId) {
    			var self = this;
    			this.barcodes = new Barcodes({
    				url : '/ir/secure/api/library/getBarcodes?assayId=' +  assayId
    			});
    			this.barcodes.fetch({
    				success: function(){
    					self.gridView = new LibraryBatchGridView({
    	                	data: self.options.data,
    	                	barcodes: self.barcodes.toJSON()
    	                });
    					if(!self.isEdit)
    						self.gridView._filters.assayId=assayId;
    					self.renderSubView(self.gridView, "#libraryGrid");
    				}
    			});
    			
			},
    		
    		delegateEvents: function() {
    			BaseModalView.prototype.delegateEvents.apply(this, arguments);
    			this.$el.on('hidden', _.bind(this.onHide, this));
            },
    		
            save: function() {
            	this.disableButton();
            	var that = this;
            	if(!this.isEdit) {
            		this.model.set('assayId', parseInt($("#libraryBatchAssay").val())); 
            	}
		        this.model.set('libraryKitBarcode', $("#libraryKitBarcode").val());
		        this.model.set('libraryPrepType', $("#libraryPrepType").html());
		        this.model.set('panelKitBarcode', $("#panelKitBarcode").val());
		        this.model.set('controlKitBarcode', $("#controlKitBarcode").val());
		        this.model.set('cnvcalibratorBarcode', $("#cnvCalibrator").val());
		        if(this.options.needsReason){
		        	this.model.set('reason',this.$el.find('#reason-for-change').val());
		        }
		        var list = this.gridView.$el.data('kendoGrid').dataSource.data().toJSON();
		        var _final = [] 
                if(this.gridView.$el.data('kendoGrid')){
                	this.gridView.$el.find('table tbody tr').each(function(index){
                		var temp = list[index];
                		var libData ={};
                		libData.libraryType = temp.libraryType;
                		libData.cnvFlag  = false;
                		libData.specimenId = temp.specimenId;
                		libData.specimenName = temp.specimenName;
                		libData.libraryName = $(this).find('input[name="libraryName"]').val();
                		libData.inputQuantity = $(this).find('input[name="inputQuantity"]').val();
                		libData.barcodeId = $(this).find('select').val();
                		libData.tumorCellularity = temp.tumorCellularity;
                		if(temp.id){
                			libData.id=temp.id;
                		} else if(temp.controlId) {
                			libData.controlId=temp.controlId;
                		}
                		
                		_final[index] = libData;
                	});
                }
                this.model.set('librarySpecimenDtoLst',_final);
                this.model.save(this.model.toJSON(), {
                    success: _.bind(this._onSaveSuccess, this),
                    error: _.bind(this.enableButton, this)
                });
            },
            
            _onSaveSuccess: function(model, response) {
                this.closeDialog();
                if (_.isFunction(this.completeAction)) {
                    this.completeAction(response);
                }
            },

            closeDialog: function() {
                this.$el.modal('hide');
            },
			
			_selectAssay: function(e) {
				this.assayId= parseInt($(e.currentTarget).val());
				this._renderDetails(this.assayId);
			}
        });

        return PrepareLibraryBatchView;
    });
