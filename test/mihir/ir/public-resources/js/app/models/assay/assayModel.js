/*global define:false*/
define(['models/baseModel', 
        'data/assay', 
        'models/libraryKitType', 
        'models/variantDetection', 
        'models/filterChain', 
        'models/cnvBaseline',
        'models/common/reasonModel',
        'views/common/auditReasonView'],
	function(BaseModel,
			Constants, 
			LibraryKitType, 
			VariantDetection, 
			FilterChain, 
			CNVBaseline, 
			ReasonModel,
			AuditReasonView) {

    "use strict";

    var APPLICATION_TYPE = "applicationType",
    	VERSION = "applicationVersion",
        REFERENCE = "genomeReference",
        PANEL = "panelBedFile",        
        HOTSPOT = "hotspotBedFile",
        FUSIONPANEL = "fusionBedFile",
        FUSIONREFERENCE='fusionReference',
        LIBRARY_KIT_TYPE = "rdxKitinfoByLibrarykitId",
        TEMPLATING_KIT = "rdxKitinfoByTemplatekitId",
        CONTROL = "rdxInternalcontrol",
        EXTRACTION_KIT = "extractionKit",
        BARCODE_KIT = "rdxKitinfoByBarcodingkitId",
        SEQUENCING_KIT = "rdxKitinfoBySequencingkitId",
        SEQUENCING_CHIP = "rdxKitinfoByChipkitId",
        FLOWS = "flows",
        RUNTEMPLATE_QC = "rdxRuntemplateqcs",
        FILTERCHAIN = "filterChain",
        BASELINE = "baseline",
    	MODULES = "modules",
    	ANNOTATIONSET = "annotationSet",
    	CLASSIFICATIONSET = "classificationSet",
    	REPORTTEMPLATE = "reportTemplate",
    	WORKFLOWID = "workflowId",
    	ASSAYID = "assayId",
    	ASSAYCONTROLS = "assayControlDtos",
    	PLUGINS = "pluginsDto",
    	GENEFILE = 'geneFile',
    	GENEFILENAME = 'geneFileName',
    	CONTROL_KIT = 'controlKit',
    	PANEL_KIT = 'panelKit',
    	PRIMER_SELECTION = "primerSelection",
    	PRIMERS_VALID = "primersValid",
    	PRIMERS = 'metagenomicsPrimers',
    	METAGENOMIC_REF = 'metagenomicsRefLib',
    	GENERIC_REF='genericReferences',
    	RUNCNV = "runCnvAlgo",
		APPLYCNV = "applyCnv",
		CNVCALIBRATOR = "cnvCalibrator",
		CNVID = "cnvBaselineId",
		CNVNAME = 'cnvBaselineName',
		CELLULARITYFLAG = 'cellularityFlag',
		PERCENTCELLULARITY = 'percentCellularity',
    	SUBSETREPORT = "isSummaryReport",
    	ISEDIT = 'isEditAssay',
		ISCOPYASSAY = 'isCopyAssay';

    var TYPES = _.object(_.keys(Constants.ApplicationTypes), _.keys(Constants.ApplicationTypes));
    var GROUPS = _.object(_.keys(Constants.SpecimenGroups), _.keys(Constants.SpecimenGroups));
    var EDIT_WORKFLOW_ACTION = 'EDIT';

    var Assay = BaseModel.extend({
        urlRoot: '/ir/secure/api/assay/loadAssayDetails?id=',

        defaults: {
            applicationType: Constants.ApplicationTypes.DNA.identifier
        },

        methodUrl: {
        	'create': '/ir/secure/api/assay/createAssay',
            'update': '/ir/secure/api/assay/updateAssay'
        },

        sync: function(method, model, options) {
            if (model.methodUrl && model.methodUrl[method.toLowerCase()]) {
                options = options || {};
                options.url = model.methodUrl[method.toLowerCase()];
            }
            /*if(method === 'create' || method ==='update'){
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
		    }*/
            Backbone.sync(method, model, options);
        }, 

        initialize: function(options) {
        	var that = this;
        	options = options || {};
            this.assayId = options.id;
            
            if(options.url){
            	this.url = options.url;
            }
        },
        
        url : function(){
       		return this.urlRoot+this.assayId;
        },

        parse : function(response) {
            return response;
        },

        getApplicationType: function() {
            return this.get(APPLICATION_TYPE);
        },

        setApplicationType: function(type) {
            this.set(APPLICATION_TYPE, type);
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
        
        getHotspot: function(){
        	return this.get(HOTSPOT);
        },
        
        setHotspot: function(hotspot){
        	this.set(HOTSPOT, hotspot);
        },
        
        getVersion: function(){
            return this.get(VERSION);
        },
        
        setVersion: function(version){
            this.set(VERSION, version);
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
        
        setControl: function(control) {
            this.set(CONTROL, control);
        },
        
        getControl: function() {
            return this.get(CONTROL);
        },
        
        setExtractionKit: function(kit) {
            this.set(EXTRACTION_KIT, kit);
        },
        
        getExtractionKit: function() {
            return this.get(EXTRACTION_KIT);
        },
        
        setTemplateQc: function(qc) {
        	this.set(RUNTEMPLATE_QC, qc);
        },
        
        getTemplateQc: function(){
        	this.get(RUNTEMPLATE_QC);
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
        
        setFlows: function(flows) {
            this.set(FLOWS, flows);
        },
        
        getFlows: function() {
            return this.get(FLOWS);
        },
                
        setFilterChain: function(filter) {
            this.set(FILTERCHAIN, filter);
        },
        
        getFilterChain: function() {
            return this.get(FILTERCHAIN);
        },
        
        setBaseline: function(baseline) {
            this.set(BASELINE, baseline);
        },
        
        getBaseline: function() {
            return this.get(BASELINE);
        },
        
        setModules: function(modules) {
        	this.set(MODULES, modules);
        },
        
        getModules: function() {
        	return this.get(MODULES);
        },
        
        setAnnotationSet: function(annotationSet) {
        	this.set(ANNOTATIONSET, annotationSet);
        },
        
        getAnnotationSet: function() {
        	return this.get(ANNOTATIONSET);
        },
        
        setClassificationSet: function(classificationSet) {
        	this.set(CLASSIFICATIONSET, classificationSet);
        },
        
        getClassificationSet: function() {
        	return this.get(CLASSIFICATIONSET);
        },
        
        setReportTemplate: function(reportTemplate) {
        	this.set(REPORTTEMPLATE, reportTemplate);
        },
        
        getReportTemplate: function() {
        	return this.get(REPORTTEMPLATE);
        },
        
        setWorkflowId : function(workflowId) {
        	this.set(WORKFLOWID, workflowId);
        },
        
        getWorkflowId : function() {
        	return this.get(WORKFLOWID);
        },
        
        setAssayId: function(assayId) {
        	this.set(ASSAYID, assayId);
        },
        
        getAssayId: function(){
        	return this.get(ASSAYID);
        },
        
        getAssayControls: function(){
        	return this.get(ASSAYCONTROLS);
        },
        
        setAssayControls: function(controls){
        	this.set(ASSAYCONTROLS, controls);
        },
        
        getSelectedPlugins: function(){
        	return this.get(PLUGINS);
        },
        
        setSelectedPlugins: function(plugins){
        	this.set(PLUGINS,plugins);
        },
        
        getGeneFile: function(){
        	return this.get(GENEFILE);
        },
        
        setGeneFile: function(gene){
        	this.set(GENEFILE,gene);
        },
        
        getControlKit: function(){
        	return this.get(CONTROL_KIT);
        },
        
        setControlKit: function(controlKit){
        	this.set(CONTROL_KIT,controlKit);
        },
        
        getPanelKit: function(){
        	return this.get(PANEL_KIT);
        },
        
        setPanelKit: function(panelKit){
        	this.set(PANEL_KIT,panelKit);
        },
        
        getPrimerSelection : function() {
            return this.get(PRIMER_SELECTION);
        },

        setPrimerSelection: function(primerSelection) {
            this.set(PRIMER_SELECTION, primerSelection);
        },
        
         getPrimers: function() {
            return this.get(PRIMERS);
        },
        setPrimers: function(primerSequences) {
            this.set(PRIMERS, primerSequences);
        },
        
        getPrimersValid: function() {
            return this.get(PRIMERS_VALID);
        },

        setPrimersValid: function(valid) {
            this.set(PRIMERS_VALID, valid);
        },
        
        setMetagenomicRef: function(ref){
        	this.set(METAGENOMIC_REF, ref);        	
        },
        
        getMetagenomicRef: function(){
        	return this.get(METAGENOMIC_REF);
        },
        
        setGenericRef: function(ref){
        	this.set(GENERIC_REF, ref);        	
        },
        
        getGenericRef: function(){
        	return this.get(GENERIC_REF);
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
        
        setSubsetReport: function(isSubsetReport){
        	this.set(SUBSETREPORT,isSubsetReport);
        },
        
        getSubsetReport: function(){
        	return this.get(SUBSETREPORT);
        },
        
        setIsEditAssay: function(isIt){
        	this.set(ISEDIT, isIt);        	
        },
        
        getIsEditAssay: function(){
        	return this.get(ISEDIT);
        },
		
		setIsCopyAssay: function(isCopyAssay){
        	this.set(ISCOPYASSAY, isCopyAssay);        	
        },
        
        getIsCopyAssay: function(){
        	return this.get(ISCOPYASSAY);
        },
        
        setGeneFileName: function(geneFileName){
        	this.set(GENEFILENAME,geneFileName);
        },
        
        getGeneFileName: function(){
        	return this.get(GENEFILENAME);
        }
    });

    return Assay;
});
