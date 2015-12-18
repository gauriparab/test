/*global define:false*/
define(['models/baseModel'], function (BaseModel) {
	"use strict";
	
	var REFERENCE = "referenceLibList",
        ASSAYID = "assayId",
        APPLICATION_TYPE = "applicationType";
	
	var Panel = BaseModel.extend({
		url: '/ir/secure/api/assay/validateReferences',
	    
	    getReference: function() {
            return this.get(REFERENCE);
        },

        setReference: function(reference) {
            this.set(REFERENCE, reference);
        },
        
        setAssayId: function(assayId) {
        	this.set(ASSAYID, assayId);
        },
        
        getAssayId: function(){
        	return this.getAssayId();
        },
        
        setApplicationType: function(applicationType){
        	this.set(APPLICATION_TYPE,applicationType);
        },
        
        getGeneFile: function(){
        	return this.get(APPLICATION_TYPE);
        }
	});

	return Panel;
});