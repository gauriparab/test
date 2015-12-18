/*global define:false*/
define(['views/ParentView', 
        'views/libraryKitView', 
        'views/templateKitView', 
        'views/sequencingChipView',
        'views/sequencingKitView',
        'views/extractionKitView',
        'views/reagentBarcodeView',
        'views/controlKit',
        'views/panelKit',
        'models/assay/reagent',
        'events/eventDispatcher',
        'hb!templates/reagent.html'],
    function(ParentView, 
		LibraryKitView, 
		TemplateKitView, 
		SequencingChipView, 
		SequencingKitView,
		ExtractionKitView,
		ReagentBarcodeView,
		ControlKitView,
		PanelKitView,
		Reagent,
		dispatcher,
		template) {
	
    "use strict";
            
    var ReagentView = ParentView.extend({
        initialize: function(options) {
        	dispatcher.on("change:libraryKitType", this._libraryKitTypeChanged, this);
        	dispatcher.on("change:templatingKit", this._templatingKitChanged, this);
        	dispatcher.on("change:sequencingChip", this._sequencingChipChanged, this);
        	dispatcher.on("change:sequencingKit", this._sequencingKitChanged, this);
        	dispatcher.on("change:extractionKit", this._extractionKitChanged, this);
        	dispatcher.on("change:barcodeKit", this._barcodeKitChanged, this);
        	dispatcher.on("change:controlKit", this._controlKitChanged, this);
        	dispatcher.on("change:panelKit", this._panelKitChanged, this);
        	dispatcher.on("set:updateFlowsFlag", this.setShouldUpdateFlows, this);
        	dispatcher.on('change:selection', this._updateFlows,this);
        	dispatcher.on('update:selection', this._updateFlows,this);
		    this.modelFragement = new Reagent();
		    this.modelFragement.set("assayId", this.model.getAssayId());		    
        },

		events: {
		    'change input#reagentFlows' : '_setFlows'
		},
        
        delegateEvents: function() {
            ParentView.prototype.delegateEvents.apply(this, arguments);
        },
        
        undelegateEvents: function() {
            ParentView.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
        	var self = this;
        	
        	this.modelFragement.fetch({
        		success: function(){
        			self.model.setLibraryKitType(self.modelFragement.getLibraryKitType());
        			self.model.setTemplatingKit(self.modelFragement.getTemplatingKit());
        			self.model.setSequencingKit(self.modelFragement.getSequencingKit());
        			self.model.setSequencingChip(self.modelFragement.getSequencingChip());
        			self.model.setReagentBarcode(self.modelFragement.getReagentBarcode());
        			if(!(self.model.toJSON().applicationType == "DNA" && self.model.toJSON().applicationVersion.value == "IR36")){
        				self.model.setPanelKit(self.modelFragement.getPanelKit());
        			}
        			if(self.model.getApplicationType() !== "METAGENOMICS" && self.model.getApplicationType() !== "DNA_GENERIC" && self.model.getApplicationType() !== "DNA"){
            			self.model.setExtractionKit(self.modelFragement.getExtractionKit());
        			}
        			if(self.model.getApplicationType() !== "METAGENOMICS" && self.model.getApplicationType() !== "DNA_GENERIC" && self.model.getApplicationType() !== "DNA"){
	        			self.model.setControlKit(self.modelFragement.getControlKit());
        			}
        			self.model.setFlows(self.modelFragement.getFlows());
        	        self.libraryKitView = new LibraryKitView({
        	        	model: self.model
        	        });
        	        self.templateKitView = new TemplateKitView({
        	        	model: self.model
        	        });
        	        self.sequencingChipView = new SequencingChipView({
        	        	model: self.model
        	        });
        	        self.barcodeKitView = new ReagentBarcodeView({
        	        	model: self.model
        	        });
        	        if(!(self.model.toJSON().applicationType == "DNA" && self.model.toJSON().applicationVersion.value == "IR36")){
        	        	self.panelKitView = new PanelKitView({
	        	        	model:self.model
	        	        });
        	        }
        	        if(self.model.getApplicationType() !== "METAGENOMICS" && self.model.getApplicationType() !== "DNA_GENERIC" && self.model.getApplicationType() !== "DNA"){
	        	        self.extractionKitView = new ExtractionKitView({
	        	        	model: self.model
	        	        });
        	        }
        	        
        	        if(self.model.getApplicationType() !== "METAGENOMICS" && self.model.getApplicationType() !== "DNA_GENERIC" && self.model.getApplicationType() !== "DNA"){
        	        	 self.controlKitView = new ControlKitView({
 	        	        	model:self.model
 	        	        });
        			}
        			self.$el.html(template({
        				//flows: self.modelFragement.getFlows()
        			}));
        			self.renderSubView(self.libraryKitView, "#libraryKitDiv");
        			self.renderSubView(self.templateKitView, "#templatingKitDiv");
        			self.renderSubView(self.sequencingChipView, "#sequencingChipDiv");
        			if(!(self.model.toJSON().applicationType == "DNA" && self.model.toJSON().applicationVersion.value == "IR36")){
        				self.renderSubView(self.panelKitView, "#panelKitDiv");
        	        }
        			if(self.model.getApplicationType() !== "METAGENOMICS" && self.model.getApplicationType() !== "DNA_GENERIC" && self.model.getApplicationType() !== "DNA"){
            			self.renderSubView(self.extractionKitView, "#extractionKitDiv");
        			}
        			if(self.model.getApplicationType() !== "METAGENOMICS" && self.model.getApplicationType() !== "DNA_GENERIC" && self.model.getApplicationType() !== "DNA"){
        				self.renderSubView(self.controlKitView, "#controlKitDiv");
        			}
        			self.renderSubView(self.barcodeKitView, "#barcodeKitDiv");
        			if(self.model.toJSON().applicationVersion.value == "IR36" && self.model.getApplicationType() == "DNA") {
        				$('#reagentFlows').prop('disabled', 'disabled');
        			}
        		}
        	});
        	return this;
        },
        
        _libraryKitTypeChanged: function(libraryKitType) {
		    this.modelFragement.setLibraryKitType(libraryKitType);
		},

		_templatingKitChanged: function(templatingKit) {
	        this.modelFragement.setTemplatingKit(templatingKit);
		},
        
        _sequencingChipChanged: function(sequencingChip) {
        	this.modelFragement.setSequencingChip(sequencingChip);
        	this._updateFlows();
        },

        _sequencingKitChanged: function(sequencingKit) {
        	this.modelFragement.setSequencingKit(sequencingKit);
        	this._updateFlows();
        },
        
        _extractionKitChanged : function(extractionKit) {
        	this.modelFragement.setExtractionKit(extractionKit);
        },
        
        _barcodeKitChanged: function(barcodeKit) {
        	this.modelFragement.setReagentBarcode(barcodeKit);
        },
        
        _controlKitChanged: function(controlKit){
        	this.modelFragement.setControlKit(controlKit);
        },
        
        _panelKitChanged: function(panelKit){
        	this.modelFragement.setPanelKit(panelKit);
        },
        
        _setFlows: function(e){
            var attr =  e.currentTarget.value;
            this.model.setFlows(attr);
            this.modelFragement.setFlows(attr);
            this.model.trigger('change');
        },
        
        _updateFlows: function(){
        	if(this.shouldUpdateFlows) {
	        	var seqKitId = $('#sequencingKit').val();
	        	var seqChipId = $('#sequencingChip').val();
	        	var tempKitSize = $('#tempKit').val();
	        	
	        	if(seqKitId && seqChipId && tempKitSize){
	        		var url = '/ir/secure/api/assay/flows?';
		        	var seqKit = 'sequencingKitId='+seqKitId+'&';
		        	var seqChip = 'sequencyingChipKitId='+seqChipId+'&';
		        	var tempSize = 'templateSize='+tempKitSize;
		        	
		        	url += seqKit;
		        	url += seqChip;
		        	url += tempSize;
		        	
		        	$.ajax({
		                url: url,
		                type: 'GET',
		                contentType: 'application/json',
		                dataType: 'json',
		                success: function(data) {
		                	$('#reagentFlows').val(data.flows);
		                	$('input[id="reagentFlows"]').trigger('change',{});
		                }
		            });        		
	        	}
	        	this.shouldUpdateFlows=false;
        	} else {
        		$('#reagentFlows').val(this.model.getFlows());
        		$('input[id="reagentFlows"]').trigger('change',{});
        	}
        },
        
        setShouldUpdateFlows: function() {
        	this.shouldUpdateFlows=true;
        }

    });

    return ReagentView;
});
