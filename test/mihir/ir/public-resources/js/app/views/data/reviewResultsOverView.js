/* global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'models/analysis/analysisModel',
    'collections/variants/classifications',
    'views/data/loadingMetricsView',
    'views/data/filteringMetricsView',
    'views/data/qcReportDetailsView',
    'views/data/qcView',
    'views/data/histoGram',
    'views/data/summary',
    'views/data/files',
    'views/data/auditTrailView',
    'views/data/signOffView',
    'views/data/signedOffFilesView',
    'views/data/alleleCoverage',
    'views/data/variantFiltersView',
    'views/data/varient',
    'views/data/functionalGridView',
    'views/data/populationGridView',
    'views/data/ontologiesGridView',
    'views/data/simGridView',
    'views/data/fusionGridView',
    'views/data/cnvGridView',
    'views/data/clinicalCnvGridView',
    'views/data/clinicalFusionGridView',
    'views/data/hotspotVariantsGridView',
    'views/data/pharmacogenomicsGridView',
    'views/common/baseModalView',
    'views/data/signOffDetailsView',
    'views/assay/plannedRunsDetailsView',
    'views/data/pluginsView',
    'views/data/variantClinicalSummaryView',
    'views/analysis/metagenomics/analysisMetagenomicsResultView',
    'views/data/annotationSourcesDetailsView',
    'hb!templates/data/review-result-overview.html'
].concat('bootstrap'),
    function(
        $,
        _,
        Backbone,
        AnalysisModel,
        Classifications,
        LoadingMetricsView,
        FilteringMetricsView,
        QcReportDetailsView,
        QCView,
        HistoGramView,
        Summary,
        FilesData,
        AuditTrailView,
        SignOffView,
        SignedOffFilesView,
        AlleleCoverage,
        VariantFiltersView,
        Varient,
        FunctionalGridView,
        PopulationGridView,
        OntologiesGridView,
        SimGridView,
        FusionGridView,
        CnvGridView,
        ClinicalCnvGridView,
        ClinicalFusionGridView,
        HotspotVariantsGridView,
        PharmacogenomicsGridView,
        BaseModalView,
        SignOffDetailsView,
        PlannedRunDetailsView,
        PluginsView,
        VariantClinicalSummaryView,
        AnalysisMetagenomicsResultView,
        AnnotationSourcesDetailsView,
        template) {
	'use strict';

    var ReviewResultsOverView = Backbone.View.extend({

        _template: template,
        _loadingMetricsEl: "#loadingMetrics",
        _filteringMetricsEl: "#filteringMetrics",
        _qcReportDetailsEl: "#qcReportDetails",
        _runQcEl: "#runQc",
        _controlQcEl: "#controlQc",
        _sampleQcEl: "#sampleQc",
        _histoGramEl: "#histoGram",
        _signOffDetailsEl: "#signOffDetails",
        _configSummaryEl: "#configSummary",
        _targetSummaryEl: "#targetSummary",
        _variantSummaryEl: "#variantSummary",
        _instrumnetSummaryEl: "#instrumnetSummary",
        _auditDataEl : "#auditData",
        _filesDataEl : "#filesData",
        _alleleCoverageEl : "#alleleCoverageData",
       _varientEl : "#varientData",
       _functionalGridEl : "#functional-grid",
       _populationGridEl : "#population-grid",
       _ontologiesGridEl : "#ontologies-grid",
       _pharmacogenomicsGridEl : "#pharmacogenomics-grid",
       _simGridEl : "#sim-grid",
       _fusionGridEl : "#fusion-grid",
       _cnvGridEl : "#cnv-grid",
       _hotspotVariantGridEl : "#hotspotVariant-grid",
       _clinicalFusionGridEl : "#clinicalfusion-grid",
       _clinicalCnvGridEl : "#clinicalcnv-grid",
       _pluginsEl : '#pluginsInfo',
       _variantTabSummaryEl : '#variantsummary',
       _clinicalSummaryEl : '#clinicalsummary',
       _metagenomicsResultEl : '#metagenomicsresult',

        initialize: function(options) {
            options = options || {};
            this.applicationMode = options.applicationMode;
            this.resultId = options.resultId;
            if(options.auditConfig && options.auditConfig['Planned Runs']){
            	this.needsReason = options.auditConfig['Planned Runs'].needsReason;
            } else{
            	this.needsReason=false;
            }
            this.showClassification = options.showClassification;
            this.tabConfigs = options.tabConfigs;
            this.analysisModel = new AnalysisModel({id:this.resultId});
            this.loadingMetricsView = new LoadingMetricsView({
            	id: options.resultId
            });
            this.filteringMetricsView = new FilteringMetricsView({
            	id: options.resultId
            });
            /*this.qcReportDetailsView = new QcReportDetailsView({
            	id: options.resultId
            });*/
            this.runQcView = new QCView({
            	id: options.resultId,
            	type: "Run QC"
            });
            this.sampleQcView = new QCView({
            	id: options.resultId,
            	type: "Sample QC"
            });
            this.histoGramView = new HistoGramView({
            	id: options.resultId,
            	type: "Sample QC"
            });
            this.signOffDetailsView = new SignOffDetailsView({
            	id: options.resultId
            });
            this.controlQcView = new QCView({
            	id: options.resultId,
            	type: "Internal Control QC"
            });
            this.configSummary = new Summary({
            	id: options.resultId,
            	type: "runConfiguration"
            });
            this.targetSummary = new Summary({
            	id: options.resultId,
            	type: "target"
            });
            this.variantSummary = new Summary({
            	id: options.resultId,
            	type: "variant"
            });
            this.instrumentSummary = new Summary({
            	id: options.resultId,
            	type: "instrument"
            });
            this.auditData = new AuditTrailView({
            	resultId : options.resultId
            });
            this.filesData = new FilesData({
            	id: options.resultId,
            	type: "files"
            });
            this.alleleCoverage = new AlleleCoverage({
            	resultId: options.resultId
            });
            this.varient = new Varient({
            	resultId: options.resultId
            });
            this.pluginsView = new PluginsView({
            	id: options.resultId
            });
            this.variantSummaryView = new VariantClinicalSummaryView({
            	id: options.resultId,
            	url: '/ir/secure/api/data/additionalTestResultSummaryByFilter'
            });
            this.clinicalSummaryView = new VariantClinicalSummaryView({
            	id: options.resultId,
            	url: '/ir/secure/api/data/targetTestResultSummaryByFilter'
            });
            this.libraryName= options.libraryName;

            this.variantFiltersView;
            this.classifications=new Classifications({
            	id:options.resultId
            });
            this.classifications.fetch();
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
        },

        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        events: {
        	'click #reportGermBtn' : '_exportGermlinePDF',
        	'click #signOffBtn': '_onOpenSignOff',
        	'click #reportFusionBtn': '_exportFusionPDF',
        	'click #downloadFiles': '_onOpenDownloadFiles',
        	'click #sidebarClose' : '_sidebarClose',
            'click #sidebarOpen' : '_sidebarOpen',
            'click #planReview' : '_showPlanDetails',
            'click #variantExport' : '_exportVariant',
            'click #targetExport' : '_exportTarget'
        },

        render: function() {
            this.$el.html(this._template({
                reportName: this.options.reportName,
                assay: this.options.assay,
                assayId: this.options.assayId,
                libraryPrepId: this.options.libraryPrepId,
                libraryName: this.options.libraryName,
                plannedRun: this.options.plannedRun,
                resultId: this.options.resultId,
                isCandidate: this.options.isCandidate,
                isReportCreated: this.options.isReportCreated,
                sampleType: this.options.sampleType,
                specimenId: this.options.specimenId,
                libraryNames: this.options.libraryNames,
                isFusion: this.options.isFusion,
                tabConfigs:  this.tabConfigs,
                isQCPassed: this.options.isQCPassed,
                isAnalysisComplete: this.options.isAnalysisComplete,
                isSignOff: this.options.isSignOff,
                qcValue: this.options.qcValue,
                canExport:this.options.canExport,
                showFilterChain: this.options.showFilterChain,
                genericWorkflow:this.options.genericWorkflow,
                isPluginsEnabled: this.options.isPluginsEnabled,
                showDownload: this.options.showDownload
            }));
            this.renderMetricsView();
            var self = this;
            $('a[data-toggle="tab"]').on('show', function (e) {
            	var tab = $(e.target).attr("href");
            	if(tab === "#metrics"){
            		self.renderMetricsView();
            	} else if(tab === "#qcReport"){
            		self.renderQcReportView();
            	} else if(tab === "#summary"){
            		self.renderSummaryView();
            	} else if(tab === "#audit"){
            		self.renderAuditView();
            	} else if(tab === "#files"){
            		self.renderFilesView();
            	} else if(tab === "#alleleCoverage"){
            		self.renderAlleleCoverageView();
            	} else if(tab === "#varient"){
            		if($("a[href='#variantsummary']").length === 0){
            			self.renderVarientView();
            		} else{
            			$("a[href='#variantsummary']").click();
            		}
            	} else if(tab === "#annotation"){
            		self.renderAnnotationView();
            	} else if(tab === "#clinical"){
            		$("a[href='#clinicalsummary']").click();
            	} else if(tab === '#plugins'){
            		self.renderPluginsView();
            	} else if(tab === '#metagenomicsresult'){
            		self.renderMetagenomicsResult();
            	}

            });
            $('a[data-toggle="pill"]').on('show', function(e) {
            	var tab = $(e.target).attr("href");
            	$('#variantExport').attr('alt',$(e.target).html());
            	$('#targetExport').attr('alt',$(e.target).html());
            	if(tab === "#population") {
            		self.renderPopulationGrid();
            	} else if(tab === "#ontologies") {
            		self.renderOntologiesGrid();
            	} else if(tab === "#pharmacogenomics") {
            		self.renderPharmacogenomicsGrid();
            	} else if(tab === "#sim") {
            		self.igvType = "DNA";
            		self.renderSimGrid($(e.currentTarget).html());
            		$('#variantExport').show();
            	} else if(tab === "#fusion") {
            		self.igvType = "RNA";
            		self.renderFusionGrid($(e.currentTarget).html());
            		$('#variantExport').show();
            	} else if(tab === "#cnv") {
            		self.igvType = "DNA";
            		self.renderCnvGrid($(e.currentTarget).html());
            		$('#variantExport').show();
            	} else if(tab === "#variantsummary") {
            		self.renderVariantSummary($(e.currentTarget).html());
            		$('#variantExport').hide();
            	} else if(tab === "#clinicalfusion") {
            		self.igvType = "RNA";
            		self.renderClinicalFusionGrid($(e.currentTarget).html());
            		$('#targetExport').show();
            	} else if(tab === "#clinicalcnv") {
            		self.igvType = "DNA";
            		self.renderClinicalCnvGrid($(e.currentTarget).html());
            		$('#targetExport').show();
            	} else if(tab === "#clinicalsummary") {
            		self.renderClinicalSummary($(e.currentTarget).html());
            		$('#targetExport').hide();
            	} else if(tab === "#hotspotVariant") {
            		self.renderClinicalView($(e.currentTarget).html());
            		$('#targetExport').show();
            	}
            });
        },

        _exportGermlinePDF: function(e) {
        	window.location.href = "/ir/secure/api/report/download?id=" + $(e.currentTarget).attr('alt')+"&downloadType=Analytical";
        },

        _exportFusionPDF: function(e) {
        	window.location.href = "/ir/secure/api/report/download?id=" + $(e.currentTarget).attr('alt')+"&downloadType=Clinical";
        },

        renderMetricsView: function() {
        	this.loadingMetricsView.setElement(this._loadingMetricsEl).render();
            this.filteringMetricsView.setElement(this._filteringMetricsEl).render();
        },

        renderQcReportView:function() {
        	this.runQcView.setElement(this._runQcEl).render();
        	this.controlQcView.setElement(this._controlQcEl).render();
        	if(!this.tabConfigs.metagenomics){
        		this.sampleQcView.setElement(this._sampleQcEl).render();
        	}
        	this.histoGramView.setElement(this._histoGramEl).render();
        	this.signOffDetailsView.setElement(this._signOffDetailsEl).render();
        },

        renderSummaryView: function() {
        	this.configSummary.setElement(this._configSummaryEl).render();
        	this.targetSummary.setElement(this._targetSummaryEl).render();
        	this.variantSummary.setElement(this._variantSummaryEl).render();
        },

        renderClinicalSummary: function(val) {
        	var flag = this._validateTab(this._clinicalSummaryEl, val, "Target");
        	if(flag){
        		this.clinicalSummaryView.setElement(this._clinicalSummaryEl).render();
        	}
        },

        renderVariantSummary: function(val) {
        	var flag = this._validateTab(this._variantTabSummaryEl, val, "Variants");
        	if(flag){
        		this.variantSummaryView.setElement(this._variantTabSummaryEl).render();
        		$('#sidebar').empty();
        	}
        },

        renderAuditView : function() {
        	this.auditData.setElement(this._auditDataEl).render();
        },

        renderFilesView : function() {
        	this.filesData.setElement(this._filesDataEl).render();
        },

        renderAlleleCoverageView : function() {
        	var flag = this._validateTab(this._alleleCoverageEl, "Coverage", "Allele");
            if(flag){
                this.alleleCoverage.setElement(this._alleleCoverageEl).render();
            }
        },

        renderVarientView : function() {
        	var flag = this._validateTab(this._varientEl, "SNP / INDEL", "Variants");
        	if(flag){
        		this.varient.setElement(this. _varientEl).render();
        	}
        },

        renderAnnotationView : function() {
        	if(!$(this._functionalGridEl).data('kendoGrid')) {
        		this.functionalGridView = new FunctionalGridView({
        			resultId : this.options.resultId
        		});
        		this.functionalGridView.setElement(this._functionalGridEl).render();
        	}
        },

        renderPopulationGrid : function() {
        	if(!$(this._populationGridEl).data('kendoGrid')) {
        		this.populationGridView = new PopulationGridView({
        			resultId : this.options.resultId
        		});
        		this.populationGridView.setElement(this._populationGridEl).render();
        	}
        },

        renderOntologiesGrid : function() {
        	if(!$(this._ontologiesGridEl).data('kendoGrid')) {
        		this.ontologiesGridView = new OntologiesGridView({
        			resultId : this.options.resultId
        		});
        		this.ontologiesGridView.setElement(this._ontologiesGridEl).render();
        	}
        },

        renderPharmacogenomicsGrid : function() {
        	if(!$(this._pharmacogenomicsGridEl).data('kendoGrid')) {
        		this.pharmacogenomicsGridView = new PharmacogenomicsGridView({
        			resultId : this.options.resultId
        		});
        		this.pharmacogenomicsGridView.setElement(this._pharmacogenomicsGridEl).render();
        	}
        },

        renderSimGrid : function(val) {
        	var flag = this._validateTab(this._simGridEl, val, "Variants");
        	if(flag){
	        	if(!$(this._simGridEl).data('kendoGrid')) {
	        		this.simGridView = new SimGridView({
	        			resultId : this.options.resultId,
	        			showClassification: this.showClassification,
	        			classifications: this.classifications.toJSON()[0].classifications
	        		});
	        		this.simGridView.on('action:view_annotationSources', this.viewAnnotationSources, this);
	        		this.simGridView.setElement(this._simGridEl);
	        	}
	    		this.renderFiltersView(this.simGridView, 'SNP');
        	}
        },

        renderFusionGrid : function(val) {
        	var flag = this._validateTab(this._fusionGridEl, val, "Variants");
        	if(flag){
	        	if(!$(this._fusionGridEl).data('kendoGrid')) {
	        		this.fusionGridView = new FusionGridView({
	        			resultId : this.options.resultId,
	        			showClassification: this.showClassification,
	        			classifications: this.classifications.toJSON()[0].classifications,
	        			mode: this.applicationMode
	        		});
	        		this.fusionGridView.setElement(this._fusionGridEl);
	        		this.fusionGridView.on('action:view_annotationSources', this.viewAnnotationSources, this);
	        	}
	    		this.renderFiltersView(this.fusionGridView, 'FUSION');
        	}
        },

        renderCnvGrid : function(val) {
        	var flag = this._validateTab(this._cnvGridEl, val, "Variants");
        	if(flag){
	        	if(!$(this._cnvGridEl).data('kendoGrid')) {
	        		this.cnvGridView = new CnvGridView({
	        			resultId : this.options.resultId,
	        			showClassification: this.showClassification,
	        			classifications: this.classifications.toJSON()[0].classifications
	        		});
	        		this.cnvGridView.on('action:view_annotationSources', this.viewAnnotationSources, this);
	        		this.cnvGridView.setElement(this._cnvGridEl);
	        	}
	        	this.renderFiltersView(this.cnvGridView, 'CNV');
        	}
        },

        renderClinicalCnvGrid : function(val) {
        	var flag = this._validateTab(this._clinicalCnvGridEl, val, "Target");
        	if(!$(this._clinicalCnvGridEl).data('kendoGrid') && flag){
        		this.clinicalCnvGridView = new ClinicalCnvGridView({
        			resultId : this.options.resultId,
        			showClassification: this.showClassification,
        			classifications: this.classifications.toJSON()[0].classifications
        		});
        		this.clinicalCnvGridView.on('action:view_annotationSources', this.viewAnnotationSources, this);
        		this.clinicalCnvGridView.setElement(this._clinicalCnvGridEl).render();
        	}
        },

        renderClinicalView : function(val) {
        	var flag = this._validateTab(this._hotspotVariantGridEl, val, "Target");
        	if(!$(this._hotspotVariantGridEl).data('kendoGrid') && flag) {
        		this.hotspotVariantsGridView = new HotspotVariantsGridView({
        			resultId : this.options.resultId,
        			showClassification: this.showClassification,
        			classifications: this.classifications.toJSON()[0].classifications
        		});
        		this.hotspotVariantsGridView.on('action:view_annotationSources', this.viewAnnotationSources, this);
        		this.hotspotVariantsGridView.setElement(this._hotspotVariantGridEl).render();
        	}
        },

        renderClinicalFusionGrid : function(val) {
        	var flag = this._validateTab(this._clinicalFusionGridEl, val, "Target");
        	if(!$(this._clinicalFusionGridEl).data('kendoGrid') && flag) {
        		this.clinicalFusionGridView = new ClinicalFusionGridView({
        			resultId : this.options.resultId,
        			showClassification: this.showClassification,
        			classifications: this.classifications.toJSON()[0].classifications
        		});
        		this.clinicalFusionGridView.on('action:view_annotationSources', this.viewAnnotationSources, this);
        		this.clinicalFusionGridView.setElement(this._clinicalFusionGridEl).render();
        	}
        },

        renderFiltersView : function(gridView, tabName) {

        	if(_.isUndefined(this.variantFiltersView)) {
	        	this.variantFiltersView =new VariantFiltersView({
	            	libraryName: this.libraryName,
	            	model: this.analysisModel,
	            	assay: this.options.assay,
	            	assayId: this.options.assayId,
	            	gridView: gridView,
	            	tabName:tabName
	            });
        	} else {
        		this.variantFiltersView.gridView =gridView;
        		this.variantFiltersView.tabName =tabName;
        	}
    		this.variantFiltersView.setElement(this.$("#sidebar")).render();
        },

        renderPluginsView: function(){
        	this.pluginsView.setElement(this._pluginsEl).render();
        },

        renderMetagenomicsResult: function(){
        	if(_.isUndefined(this.metagenomicsResultView)){
        		this.metagenomicsResultView = new AnalysisMetagenomicsResultView();
        		var self = this;
            	var urlBase = '/ir/secure/result/metagenomics/' + self.options.resultId;
            	$.ajax({
                    url: urlBase,
                    type: 'GET',
                    success: function(data) {
                    	 self.metagenomicsResultView.setElement(self._metagenomicsResultEl).setLaunchURL(urlBase + '/' + data).render();
		    }
            	});
        	}
        },

        _onOpenSignOff: function() {
            BaseModalView.open(null, {
	             el: "#openSignOff",
	             resultId : this.resultId
	        }, SignOffView);
        },

        _onOpenDownloadFiles: function() {
	         var self = this;
	         BaseModalView.open(null, {
	             el: "#openDownloadFiles",
	             resultId : self.resultId,
	             qcState : self.options.qcValue
	         }, SignedOffFilesView);
        },

        _showPlanDetails: function() {
			var plan = {};
			plan.verificationRuns = false;
			plan.id = this.options.planId;
			plan.assayId = this.options.assayId;
	    	var self= this;
	    	BaseModalView.open(null, {
	    		plan: plan,
                showEdit: false
	    	}, PlannedRunDetailsView);
        },

        _sidebarClose: function() {
       		$("#sidebar").removeClass('span3');
       		$("#filterSection").hide();
       		$("#sidebar").parent().find('div.span9').addClass('span11').removeClass('span9').css("width", "94%");
       		$("#sidebarOpen").parent().parent().show();
        },

        _sidebarOpen: function() {
        	$("#sidebarOpen").parent().parent().hide();
        	$("#sidebar").parent().find('div.span11').css("width", "").addClass('span9').removeClass('span11');
       		$("#sidebar").addClass('span3');
        	$("#filterSection").show();
        },

        _validateTab: function(el, val, tabType) {
            var tabdata = this.options.tabData;
            var flag = true;
            _.each(tabdata, function(data){
                if(data.tabName.split('_')[1] === val && data.tabName.split('_')[0] === tabType){
                	var html = "<div class='alert alert-error'>";
                    _.each(data.messages, function(message) {
                        html += "<li>" + $.t(message) + "</li>";
                    });
                    html += "</div>";
                    $(el).html(html);
                    flag = false;
                }
            });
            return flag;
        },

        _exportVariant: function(e) {
        	var self=this;
        	var tab=$(e.currentTarget).attr('alt');
        	window.location = '/ir/secure/api/data/dowloadClassificaion?resultId='+self.resultId+'&tabName=Variants_'+tab;
        },

        _exportTarget: function(e) {
        	var self=this;
        	var tab=$(e.currentTarget).attr('alt');
        	window.location = '/ir/secure/api/data/dowloadClassificaion?resultId='+self.resultId+'&tabName=Target_'+tab;
        },

        viewAnnotationSources: function(e, model) {
        	 var self = this;
             BaseModalView.open(null, {
                 el: "#viewAnnotationSources",
                 model: model,
                 type: this.igvType,
                 resultId:this.resultId,
                 mode:this.applicationMode
             }, AnnotationSourcesDetailsView);
        }
    });

    return ReviewResultsOverView;
});
