/*global define:false*/
define(['views/ParentView', 
        'views/fusionReferenceView', 
        'views/panelCollectionView', 
        'views/fusionPanelCollectionView', 
        'views/panelReferenceGenomes', 
        'views/hotspotView',
        'views/geneFilesView',
        'models/panel',
        'events/eventDispatcher',
        'hb!templates/panel-reference.html'],
    function(ParentView, 
    		FusionRefernceView, 
    		PanelCollectionView, 
    		FusionPanelCollectionView, 
    		PanelReferenceGenomesView,
    		HotspotView,
    		GeneFilesView,
    		Panel,
    		dispatcher,
    		template) {
    "use strict";

    var PanelView = ParentView.extend({
	    initialize: function(options) {		    
	    	dispatcher.on('change:genomeReference', this._genomeReferenceChanged, this);
	    	dispatcher.on('change:panelBed', this._panelBedChanged, this);
	    	dispatcher.on('change:hotspotBed', this._hotspotBedChanged, this);
	    	dispatcher.on('change:fusionReference', this._fusionReferenceChanged, this);
	    	dispatcher.on('change:fusionBed', this._fusionBedChanged, this);
	    	dispatcher.on('change:geneFile', this._geneFileChanged, this);
	    	dispatcher.on('change:subSetReport', this._subSetReportChanged,this);
		    this.modelFragement = new Panel();
	        this.modelFragement.setAssayId(this.model.getAssayId());
        },
        
        delegateEvents: function() {
            ParentView.prototype.delegateEvents.apply(this, arguments);
        },
        
        undelegateEvents: function() {
            ParentView.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
        	this.$el.html(template({}));
            var self = this;
		    this.modelFragement.fetch({
				success: function() {
					self.model.setReference(self.modelFragement.getReference());
					if(self.model.getApplicationType() !== "RNA"){
						self.model.setPanel(self.modelFragement.getPanel());
						self.model.setHotspot(self.modelFragement.getHotspot());
					}
			    	self.model.setFusionPanel(self.modelFragement.getFusionPanel());
			    	self.model.setFusionReference(self.modelFragement.getFusionReference());
			    	self.model.setGeneFile(self.modelFragement.getGeneFile());
			    	
			        self.panelReferenceGenomeView = new PanelReferenceGenomesView({
		            	model: self.model
		            });
			        
			        if(self.model.getApplicationType() !== "RNA"){
				        self.hotspotView = new HotspotView({
				        	model: self.model
				        });
			        }
			        
			        self.fusionReferenceView = new FusionRefernceView({
		                model: self.model
		            });
			        
				    self.renderSubView(self.panelReferenceGenomeView, "#referenceDiv");
				    if(self.model.getApplicationType() !== "RNA"){
				    	self.renderSubView(self.hotspotView, "#hotspotDiv");
				    }
		        	
		        	if(self.model.getApplicationType() !== 'DNA'){
		        		self.renderSubView(self.fusionReferenceView, "#fusionReferenceDiv");
		        	}
		        	if(!(self.model.toJSON().applicationVersion.value == "IR36" && self.model.getApplicationType() == "DNA")) {
		        		self.model.setSubsetReport(self.modelFragement.getSubsetReport());
		        		self.geneFilesView = new GeneFilesView({
			        		model:self.model
			        	});
		        		self.renderSubView(self.geneFilesView, '#geneFiles');
        			}
				}
			});
            return this;
        },

		_renderPanels: function() {
			if(this.modelFragement.getReference()){
				if(this.model.getApplicationType() !== "RNA"){
					this.panelCollectionView = new PanelCollectionView({
						model: this.model,
						id: this.modelFragement.getReference().id
		    		});
					this.renderSubView(this.panelCollectionView, "#panelDiv");
				}
			}
		},
		
		_renderFusions: function() {
			if(this.modelFragement.getFusionReference()){
		        this.fusionPanelView = new FusionPanelCollectionView({
	                model: this.model
	            });
				this.renderSubView(this.fusionPanelView, "#fusionPanelDiv");
			}
		},

        _genomeReferenceChanged: function(reference){
        	this.modelFragement.setReference(reference);
        	this._renderPanels();
        },
        
        _panelBedChanged: function(panel){
        	this.modelFragement.setPanel(panel);
        },
        
        _hotspotBedChanged: function(hotspot){
        	this.modelFragement.setHotspot(hotspot);
        },
        
        _fusionReferenceChanged: function(reference){
        	this.modelFragement.setFusionReference(reference);
        	this._renderFusions();
        },
        
        _fusionBedChanged: function(fusion){
        	this.modelFragement.setFusionPanel(fusion);
        },
        
        _geneFileChanged: function(geneFile){
        	this.modelFragement.setGeneFile(geneFile);
        },
        
        _subSetReportChanged: function(val){
        	this.modelFragement.setSubsetReport(val);
        }
        
        
    });

    return PanelView;
});
