/*global define:false*/
define(['models/baseModel'], function (BaseModel) {
	"use strict";
	
	var ANNOTATIONSET = "annotationSet",
		CLASSIFICATIONSET = "classificationSet",
		REPORTTEMPLATE = "reportTemplate",
		FILTERCHAIN = "filterChain",
        ASSAYID = "assayId";
	
	var Panel = BaseModel.extend({
		url: '/ir/secure/api/assay/validatePresets',
		
		fetch: function(options) {
			var self = this;
	        return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
	        	url: '/ir/secure/api/assay/getPreset?id=' + self.attributes.assayId,
	            contentType: 'application/json'
	        }));
	    },
	    
	    getAnnotationSet: function() {
        	return this.get(ANNOTATIONSET);
        },
        
	    setAnnotationSet: function(annotationSet) {
        	this.set(ANNOTATIONSET, annotationSet);
        },
        
        getClassificationSet: function() {
        	return this.get(CLASSIFICATIONSET);
        },
        
        setClassificationSet: function(classificationSet) {
        	this.set(CLASSIFICATIONSET, classificationSet);
        },        
        
        setReportTemplate: function(reportTemplate) {
        	this.set(REPORTTEMPLATE, reportTemplate);
        },
        
        getReportTemplate: function() {
        	return this.get(REPORTTEMPLATE);
        },
        
        setFilterChain: function(filter) {
            this.set(FILTERCHAIN, filter);
        },
        
        getFilterChain: function() {
            return this.get(FILTERCHAIN);
        },
        
        setAssayId: function(assayId) {
        	this.set(ASSAYID, assayId);
        },
        
        getAssayId: function(){
        	return this.getAssayId();
        }
	});

	return Panel;
});