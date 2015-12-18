/*global define:false*/
define(['models/baseModel', 
        'models/assay/cnv/panel', 
        'models/common/reasonModel',
        'views/common/auditReasonView'],
	function(BaseModel,
			Panel, 
			ReasonModel,
			AuditReasonView) {

    "use strict";

    var NAME = "name",
    	PANEL = "panel",
    	DISPLAYNAME = 'displayname',
    	NOTES = 'notes',
    	CNVBASELINEID = 'cnvBaselineId',
    	ISEXISTING = 'existingReference',
    	PANELFILE = 'panelFile',
    	REFERENCEFILE = 'referenceCnvBaseline',
    	EVALUATION = 'evaluationParameters',
    	CREATION = 'creationParameters',
    	CNVBASELINEID = 'cnvBaselineId',
    	PANELID = 'panelId',
    	SELECTEDSAMPLES = 'sampleInfoDto',
    	FILTERS = 'evaluationQCDtoList';

    var EDIT_WORKFLOW_ACTION = 'EDIT';

    var Assay = BaseModel.extend({
    	
    	urlRoot: '/ir/secure/api/cnv/getAssayId',
    	
    	methodUrl: {
        	'create': '/ir/secure/api/cnv/createCnvBaseline',
            'update': '/ir/secure/api/cnv/udpateCnvBaseline'
        },
    	
        initialize: function(options) {
        	var that = this;
        	options = options || {};
            this.needsReason = false;
            this.reasonModel = new ReasonModel({
            	obj:'cnv'
            });
            
            /*this.reasonModel.fetch({
            	success:function(){
            		var temp = that.reasonModel.toJSON();
            		that.needsReason = temp.needsReason;
            	}
            });
            
            if(options.url){
            	this.url = options.url;
            }*/
            
            if(options.url){
            	this.url = options.url;
            }
            
        },
        
        sync: function(method, model, options) {
            if (model.methodUrl && model.methodUrl[method.toLowerCase()]) {
                options = options || {};
                options.url = model.methodUrl[method.toLowerCase()];
            }
            if(method === 'create' || method ==='update'){
            	if(this.needsReason){
            		AuditReasonView.open(function() {
    		  			model.set("reason", document.getElementById("reason").value);
    		  	    	Backbone.sync(method, model, options);
    		  		});
            	} else{
            		Backbone.sync(method, model, options);
            	}
		    }else{
		    	Backbone.sync(method, model, options);
		    }
        },
        
        url : function(){
       		return this.urlRoot;
        },

        parse : function(response) {
            return response;
        },

        getName : function(){
        	return this.get(NAME);
        },
        
        setName : function(name){
        	this.set(NAME,name)
        },
        
        getDisplayName : function(){
        	return this.get(DISPLAYNAME);
        },
        
        setDisplayName : function(name){
        	this.set(DISPLAYNAME,name);
        },
        
        getNotes : function(){
        	return this.get(NOTES);
        },
        
        setNotes : function(notes){
        	this.set(NOTES, notes);
        },
        
        getCnvBaselineId : function(){
        	return this.get(CNVBASELINEID);
        },
        
        setCnvBaselineId : function(id){
        	this.set(CNVBASELINEID,id);
        },
        
        getIsExistingReference : function(){
        	return this.get(ISEXISTING)
        },
        
        setIsExistingReference : function(isIt){
        	this.set(ISEXISTING,isIt);
        },
        
        getPanelFile : function(){
        	return this.get(PANELFILE);
        },
        
        setPanelFile : function(panelFile){
        	this.set(PANELFILE,panelFile)
        },
        
        getReferenceFile : function(){
        	return this.get(REFERENCEFILE);
        },
        
        setReferenceFile : function(referenceFile){
        	this.set(REFERENCEFILE,referenceFile);
        },
        
        getEvaluationParameters: function(){
	    	return this.get(EVALUATION);
	    },
	    
	    setEvaluationParameters: function(params){
	    	this.set(EVALUATION,params);
	    },
	    
	    getCreationParameters: function(){
	    	return this.get(CREATION)
	    },
	    
	    setCreationParameters: function(params){
	    	this.set(CREATION,params);
	    },
	    
	    getPanelId: function(){
	    	return this.get(PANELID);
	    },
	    
	    setPanelId: function(id){
	    	this.set(PANELID,id);	    	
	    },
	    
	    getSelectedSamples: function(){
	    	return this.get(SELECTEDSAMPLES);
	    },
	    
	    setSelectedSamples: function(samples){
	    	this.set(SELECTEDSAMPLES, samples);
	    },
	    
	    getCnvFilters: function(){
	    	return this.get(FILTERS);
	    },
	    
	    setCnvFilters: function(filters){
	    	this.set(FILTERS,filters);
	    },
	    
	    getPanel: function(){
	    	return this.get(PANEL);
	    },
	    
	    setPanel: function(panel){
	    	this.set(PANEL,panel);
	    }
    });

    return Assay;
});
