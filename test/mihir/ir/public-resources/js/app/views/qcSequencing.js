/*global define:false*/
define(['views/ParentView',
        'views/controlDetailsView',
        'models/controlQc',
        'events/eventDispatcher',
        'hb!templates/qcSequencing.html'],
    function(ParentView, 
    		ControlDetailsView,
    		ControlQc,
    		dispatcher,
    		template) {
    "use strict";
            
    var QcSequencing = ParentView.extend({
        initialize: function(options) {
        	dispatcher.on("reset:threshold", this._resetThreshold, this);
        	dispatcher.on("change:threshold", this._updateThreshold, this);
        	dispatcher.on("change:upperThreshold", this._updateUpperThreshold, this);
            this.modelFragement = new ControlQc();
            if(this.model.getAssayId()) {
            	this.modelFragement.set("assayId", this.model.getAssayId());
            }
            else {
            	this.modelFragement.set("assayId", this.model.get("id"));
            	this.model.setAssayId(this.model.get("id"));
            }
        },
        
        events: {
        	"click ul.nav.nav-list a" : "_tabClick"
        },
        
        delegateEvents: function() {
            ParentView.prototype.delegateEvents.apply(this, arguments);
        },
        
        undelegateEvents: function() {
            ParentView.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
        	var self=this;
            this.modelFragement.fetch({
            	success: function(){
            		self.rdxRuntemplateqcs = self.modelFragement.toJSON().rdxRuntemplateqcs;
            		self.model.setTemplateQc(self.rdxRuntemplateqcs);
            		self.$el.html(template({
    	                qcs: _.keys(self.rdxRuntemplateqcs)
    	            }));
            		$("ul.nav.nav-list a").first().click();
            	}
            });          
            return this;
        },
        
        _tabClick: function(e){
        	var data = {};
        	data.name = $(e.currentTarget).data('qc');
        	data.runtemplateqcDtos = this.rdxRuntemplateqcs[$(e.currentTarget).data('qc')];
        	this._renderControlDetails(data);
        },
        
        _renderControlDetails: function(data){
        	if(data.name === "Sample QC"){
        		data.splitDnaRna = true;
        		data.applicationType = this.model.getApplicationType();
        		if(data.applicationType === "DNA")
        			data.dnaType= true;
        		else if(data.applicationType === "RNA" )
        			data.rnaType= true;
        		else {
        			data.dnaType= true;
        			data.rnaType= true;
        		}
        			
        	}
        	this.controlDetailsView = new ControlDetailsView({
        		data: data
        	});
        	this.renderSubView(this.controlDetailsView, "#qcDetails");
        },
        
        _resetThreshold: function(args){
        	var data = this.controlDetailsView.options.data;
        	_.each(data.runtemplateqcDtos, function(templateqc){
        		if(_.isEmpty(args)){
        			templateqc.threshold = templateqc.minThresholdDb;
        			templateqc.upperThreshold = templateqc.maxThresholdDb;
        		} else if(args === templateqc.libraryType){
        			templateqc.threshold = templateqc.minThresholdDb;
        			templateqc.upperThreshold = templateqc.maxThresholdDb;
        		}
        	});
        	this._renderControlDetails(data);
        	this._updateControls(data);
        },
        
        _updateThreshold: function(qcTypeId, value){
        	var data = this.controlDetailsView.options.data;
        	_.each(data.runtemplateqcDtos, function(templateqc){
        		if(templateqc.qcTypeId == qcTypeId){
        			templateqc.threshold = value;
        		}
        	});        	
        	this._updateControls(data);
        },
        
        _updateUpperThreshold: function(qcTypeId, value){
        	var data = this.controlDetailsView.options.data;
        	_.each(data.runtemplateqcDtos, function(templateqc){
        		if(templateqc.qcTypeId == qcTypeId){
        			templateqc.upperThreshold = value;
        		}
        	});        	
        	this._updateControls(data);
        },
        
        _updateControls: function(data){
        	this.rdxRuntemplateqcs[data.name] = data.runtemplateqcDtos;
        	this.modelFragement.set("rdxRuntemplateqcs", this.rdxRuntemplateqcs);
        	this.model.setTemplateQc(this.rdxRuntemplateqcs);
        	this.model.trigger('change');
        }
    });

    return QcSequencing;
    
});
