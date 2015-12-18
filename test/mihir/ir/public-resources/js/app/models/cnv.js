/*global define:false*/
define(['models/baseModel'], function (BaseModel) {
	"use strict";
	
	var RUNCNV = "runCnvAlgo",
		APPLYCNV = "applyCnv",
		CNVCALIBRATOR = "cnvCalibrator",
		CNVID = "cnvBaselineId",
		CNVNAME = 'cnvBaselineName',
		CELLULARITYFLAG = 'cellularityFlag',
		PERCENTCELLULARITY = 'percentCellularity',
		ASSAYID = "assayId";
	
	var CNV = BaseModel.extend({
		url: '/ir/secure/api/assay/validateCnvBaselinePanel',
		
		fetch: function(options) {
			var self = this;
	        return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
	        	url: '/ir/secure/api/assay/getAssayCnvBaseline?id=' + self.attributes.assayId,
	            contentType: 'application/json'
	        }));
	    },
	    
	    getRunCnv: function() {
        	return this.get(RUNCNV);
        },
        
	    setRunCnv: function(run) {
        	this.set(RUNCNV, run);
        },
        
        getApplyCnv: function() {
        	return this.get(APPLYCNV);
        },
        
        setApplyCnv: function(apply) {
        	this.set(APPLYCNV, apply);
        },
        
        getCnvCalibrator: function() {
        	return this.get(CNVCALIBRATOR);
        },
        
        setCnvCalibrator: function(calibrator) {
        	this.set(CNVCALIBRATOR, calibrator);
        },
        
        getCnvId: function() {
            return this.get(CNVID);
        },
        
        setCnvId: function(id) {
            this.set(CNVID, id);
        },
        
        getCnvName: function() {
            return this.get(CNVNAME);
        },
        
        setCnvName: function(name) {
            this.set(CNVNAME, name);
        },
        
        getCellularityFlag: function() {
            return this.get(CELLULARITYFLAG);
        },
        
        setCellularityFlag: function(cellularityFlag) {
            this.set(CELLULARITYFLAG, cellularityFlag);
        },
        
        getPercentCellularity: function() {
            return this.get(PERCENTCELLULARITY);
        },
        
        setPercentCellularity: function(percentCellularity) {
            this.set(PERCENTCELLULARITY, percentCellularity);
        },
        
        setAssayId: function(assayId) {
        	this.set(ASSAYID, assayId);
        },
        
        getAssayId: function(){
        	return this.getAssayId();
        }
	});

	return CNV;
});