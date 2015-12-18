/*global define:false*/
define(['models/baseModel'], function (BaseModel) {
	"use strict";
	
	var REFERENCE = "genomeReference",
    	PANEL = "panelBedFile",
    	FUSIONPANEL = "fusionBedFile",
        FUSIONREFERENCE='fusionReference',
        HOTSPOT = "hotspotBedFile",
        GENEFILE = "geneFile",
        GENEFILENAME = "geneFileName",
        SUBSETREPORT = "subSetReport",
        ASSAYID = "assayId",
        APPLICATIONTYPE = "applicationType";
	
	var Panel = BaseModel.extend({
		url: '/ir/secure/api/assay/validatePanel',
		
		fetch: function(options) {
			var self = this;
	        return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
	        	url: '/ir/secure/api/assay/getPanel?id=' + self.attributes.assayId,
	            contentType: 'application/json'
	        }));
	    },
	    
	    getReference: function() {
            return this.get(REFERENCE);
        },

        setReference: function(reference) {
            this.set(REFERENCE, reference);
        },
        
        getPanel: function(){
            return this.get(PANEL);
        },
        
        setPanel: function(panel){
            this.set(PANEL, panel);
        },
        
        getFusionPanel: function(){
            return this.get(FUSIONPANEL);
        },
        
        setFusionPanel: function(fusionPanel){
            this.set(FUSIONPANEL, fusionPanel);
        },
        
        getFusionReference: function(){
            return this.get(FUSIONREFERENCE);
        },
        
        setFusionReference: function(fusionReference){
            this.set(FUSIONREFERENCE, fusionReference);
        },
        
        getHotspot: function() {
        	return this.get(HOTSPOT);
        },
        
        setHotspot: function(hotspot) {
        	this.set(HOTSPOT, hotspot);
        },
        
        setAssayId: function(assayId) {
        	this.set(ASSAYID, assayId);
        },
        
        getAssayId: function(){
        	return this.getAssayId();
        },
        
        setGeneFile: function(geneFile){
        	this.set(GENEFILE,geneFile);
        },
        
        getGeneFile: function(){
        	return this.get(GENEFILE);
        },
        
        setGeneFileName: function(geneFileName){
        	this.set(GENEFILENAME,geneFileName);
        },
        
        getGeneFileName: function(){
        	return this.get(GENEFILENAME);
        },
        
        setSubsetReport: function(isSubsetReport){
        	this.set(SUBSETREPORT,isSubsetReport);
        },
        
        getSubsetReport: function(){
        	return this.get(SUBSETREPORT);
        }
	});

	return Panel;
});