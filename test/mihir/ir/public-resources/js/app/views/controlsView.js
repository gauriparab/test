/*global define:false*/
define(['views/ParentView', 
        'views/controlDetailsView',
        'models/control',
        'events/eventDispatcher',
        'hb!templates/controls.html'],
    function(ParentView, 
    		ControlDetailsView,
    		Controls,
    		dispatcher,
    		template) {
    "use strict";
            
    var ControlsView = ParentView.extend({
        initialize: function(options) {
        	dispatcher.on('change:threshold', this._updateThreshold, this);
        	dispatcher.on('change:upperThreshold', this._updateUpperThreshold, this);
        	dispatcher.on('reset:threshold', this._resetThreshold, this);
        	this.modelFragement = new Controls({
        		controlKitId: this.model.toJSON().controlKit ? this.model.toJSON().controlKit.id : "",
        		templateKitId: this.model.toJSON().rdxKitinfoByTemplatekitId ? this.model.toJSON().rdxKitinfoByTemplatekitId.id : "",
        		sequenceKitId: this.model.toJSON().rdxKitinfoBySequencingkitId ? this.model.toJSON().rdxKitinfoBySequencingkitId.id : ""
        	});
        	this.modelFragement.set("assayId", this.model.getAssayId());
        },
        
        events: {
        	"click ul.nav.nav-list a" : "_tabClick",
        	"click ul.nav.nav-list a input:checkbox" : "_checkboxClick"
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
        			self.assayControlDtos = self.modelFragement.toJSON().assayControlDtos;
        			self.model.setAssayControls(self.assayControlDtos);
    	            self.$el.html(template({
    	                controls: self.modelFragement.toJSON().assayControlDtos
    	            }));
    	            $("ul.nav.nav-list a").first().click();
        		}
        	});            
            return this;
        },
        
        _tabClick: function(e){
        	var data = _.filter(this.assayControlDtos, function(assayControl){
        		return assayControl.name === $(e.currentTarget).find('span').html().trim();
        	});
        	this._renderControlDetails(data[0]);
        },
        
        _renderControlDetails: function(data){
        	this.controlDetailsView = new ControlDetailsView({
        		data: data
        	});
        	this.renderSubView(this.controlDetailsView, "#controlDetails");
        },
        
        _checkboxClick: function(e){
        	e.stopPropagation();
        	var data = _.filter(this.assayControlDtos, function(assayControl){
        		return assayControl.name === $(e.currentTarget).attr('name').trim();
        	});
        	data[0].isChecked = $(e.currentTarget).is(":checked");
        	this._updateControls(data[0]);
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
        
        _resetThreshold: function(){
        	var data = this.controlDetailsView.options.data;
        	_.each(data.runtemplateqcDtos, function(templateqc){
        		templateqc.threshold = templateqc.minThresholdDb;
        		templateqc.upperThreshold = templateqc.maxThresholdDb;
        	});
        	this._renderControlDetails(data);
        	this._updateControls(data);
        },
        
        _updateControls: function(data){
        	var len = this.assayControlDtos.length;
        	for(var i = 0; i < len; i++){
        		if(this.assayControlDtos[i].name === data.name) {
        			this.assayControlDtos[i] = data;
        			break;
        		} 
        	}
        	this.modelFragement.set("assayControlDtos", this.assayControlDtos);
        	this.model.setAssayControls(this.assayControlDtos);
        	this.model.trigger('change');
        }
        
    });

    return ControlsView;
    
});
