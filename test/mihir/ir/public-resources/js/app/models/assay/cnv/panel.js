/*global define:false*/
define(['models/baseModel'], function (BaseModel) {
	"use strict";
	
	var NAME = "name",
	DISPLAYNAME = 'displayname',
	NOTES = 'notes',
	CNVBASELINEID = 'cnvBaselineId',
	ISEXISTING = 'existingReference',
	PANELFILE = 'panelFile',
	REFERENCEFILE = 'referenceCnvBaseline';
	
	var Panel = BaseModel.extend({
		url: '/ir/secure/api/cnv/validatePanel',
		
		fetch: function(options) {
			var self = this;
	        return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
	        	url: '/ir/secure/api/assay/getTargetRegions',
	            contentType: 'application/json'
	        }));
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
        }
	});

	return Panel;
});