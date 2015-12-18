define(['models/baseModel'], function(BaseModel){
	'use strict';
	
	var LIBRARY_KIT_TYPE = "rdxKitinfoByLibrarykitId",
    	TEMPLATING_KIT = "rdxKitinfoByTemplatekitId",
		EXTRACTION_KIT = "extractionKit",
		BARCODE_KIT = "rdxKitinfoByBarcodingkitId",
	    SEQUENCING_KIT = "rdxKitinfoBySequencingkitId",
	    SEQUENCING_CHIP = "rdxKitinfoByChipkitId",
	    CONTROL_KIT = 'controlKit',
	    PANEL_KIT = 'panelKit',
	    FLOWS = "flows";
	
	var Reagent = BaseModel.extend({
		url: "/ir/secure/api/assay/validateReagent",
		
		fetch: function(options) {
			var self = this;
	        return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
	        	url: '/ir/secure/api/assay/getReagent?id=' + self.attributes.assayId,
	            contentType: 'application/json'
	        }));
	    },
		
	    setLibraryKitType: function(kitType) {
            this.set(LIBRARY_KIT_TYPE, kitType);
        },
        
        getLibraryKitType: function() {
            return this.get(LIBRARY_KIT_TYPE);
        },
        
        setTemplatingKit: function(kit){
            this.set(TEMPLATING_KIT, kit);
        },

        getTemplatingKit: function() {
            return this.get(TEMPLATING_KIT);
        },
        
        setExtractionKit: function(kit) {
            this.set(EXTRACTION_KIT, kit);
        },
        
        getExtractionKit: function() {
            return this.get(EXTRACTION_KIT);
        },
        
        
        setSequencingKit: function(kit) {
            this.set(SEQUENCING_KIT, kit);
        },
        
        getSequencingKit: function() {
            return this.get(SEQUENCING_KIT);
        },
        
        setSequencingChip: function(chip) {
            this.set(SEQUENCING_CHIP, chip);
        },
        getReagentBarcode: function() {
            return this.get(BARCODE_KIT);
        },
        
        setReagentBarcode: function(kit) {
            this.set(BARCODE_KIT, kit);
        },
        
        getSequencingChip: function() {
            return this.get(SEQUENCING_CHIP);
        },
        
        getControlKit: function(){
        	return this.get(CONTROL_KIT);
        },
        
        setControlKit: function(controlKit){
        	return this.set(CONTROL_KIT,controlKit);
        },
        
        getPanelKit: function(){
        	return this.get(PANEL_KIT);
        },
        
        setPanelKit: function(panelKit){
        	return this.set(PANEL_KIT,panelKit);
        },
        
        setFlows: function(flows) {
            this.set(FLOWS, flows);
        },
        
        getFlows: function() {
            return this.get(FLOWS);
        }
	});
	
	return Reagent;
});