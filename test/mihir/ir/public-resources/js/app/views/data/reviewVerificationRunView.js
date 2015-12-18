/* global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'views/ParentView',
    'views/data/signOffView',
    'views/assay/templateDetailsView',
    'views/data/reviewTemplatePrep',
    'views/data/reviewSequencing',
    'views/data/reviewInstrumentInfo',
    'views/data/reviewAnalysisInfo',
    'views/data/reviewControlQc',
    'views/common/baseModalView',
    'views/data/signOffDetailsView',
    'hb!templates/data/review-verification-run-overview.html'
].concat('bootstrap'),
    function(
        $,
        _,
        Backbone,
        ParentView,
        SignOffView,
        TemplateDetailsView,
        ReviewTemplatePrep,
        ReviewSequencing,
        ReviewInstrumentInfo,
        ReviewAnalysisInfo,
        ReviewControlQc,
        BaseModalView,
        SignOffDetailsView,
        template) {
	'use strict';

    var ReviewVerificationRunsOverView = ParentView.extend({

        _template: template,
        _intrumentInfoEl: "#instrumentInfo",
        _templatePrepEl: "#templatePrep",
        _sequencingEl: "#sequencing",
        _controlQcsEl: "#controlQcs",
        _analysisInfoEl: "#analysisInfo",
        _signOffDetailsEl: "#signOffDetails",
        
        initialize: function(options) {
            options = options || {};
            this.resultId = options.reportId;
            this.reviewTemplatePrep = new ReviewTemplatePrep({
            	resultId: options.reportId
            });
            this.reviewSequencing = new ReviewSequencing({
            	resultId: options.reportId
            });
            this.reviewInstrumentInfo = new ReviewInstrumentInfo({
            	resultId: options.reportId
            });
            this.reviewAnalysisInfo = new ReviewAnalysisInfo({
            	resultId: options.reportId
            });
            this.reviewControlQc = new ReviewControlQc({
            	resultId: options.reportId
            });
            this.signOffDetailsView = new SignOffDetailsView({
            	id: options.reportId
            });
            if(options.auditConfig && options.auditConfig['Planned Runs']){
            	this.needsReason = options.auditConfig['Planned Runs'].needsReason;
            } else{
            	this.needsReason=false;
            }
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
        },

        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },
        
        events: {
        	'click #exportInstallTemplatePdf' : '_exportInstallTemplatePDF',
        	'click #signOffBtn': '_onOpenSignOff',
        	'click #templateDetails': '_showDetails',
        	'click a#print': '_print'
        },

        render: function() {
            this.$el.html(this._template({
                reportName: this.options.reportName,
                verificationTemplateName: this.options.verificationTemplateName,
                signoff: this.options.signoff,
                showSignOff : this.options.showSignOff,
                showTemplatePrep: this.options.showTemplatePrep
            }));
            if(this.options.showTemplatePrep) {
            	this.renderSubView(this.reviewTemplatePrep, this._templatePrepEl);
            }
            this.renderSubView(this.reviewSequencing, this._sequencingEl);
            this.renderSubView(this.reviewInstrumentInfo, this._intrumentInfoEl);
            this.renderSubView(this.reviewAnalysisInfo, this._analysisInfoEl);
            this.renderSubView(this.reviewControlQc, this._controlQcsEl);
            this.signOffDetailsView.setElement(this._signOffDetailsEl).render();
        },
        
        _exportInstallTemplatePDF: function(e) {
            window.location.href = "/ir/secure/api/report/download?id=" + this.resultId +"&downloadType=InstallTemplate";
        },
        
        _onOpenSignOff: function() {
            BaseModalView.open(null, {
	             el: "#openSignOff",
	             resultId : this.resultId,
	             installTemplateReport : true,
	             needsReason:this.needsReason
	        }, SignOffView);
        },
        
        _showDetails: function(){
        	new TemplateDetailsView({
	    		templateId : this.options.assayId,
	    		templateName : this.options.verificationTemplateName
	    	}).render();
        	
        	BaseModalView.open(null, {
                el: "#templateDetailsModal",
                templateId : this.options.assayId,
	    		templateName : this.options.verificationTemplateName
            }, TemplateDetailsView);
        	
        },
        
        _print: function(){
        	var html = '<html><head><style>.report-header{background-color: #fafafa;border: 1px solid #ccc;padding: 10px;color: #666666;font-size: 18px;}.report-body{    border-left: 1px solid #ccc;border-right: 1px solid #ccc;border-bottom: 1px solid #ccc;padding: 10px;margin-bottom: 25px;}</style></head><body>';
        	var body = this.$el.find('#printContent').html();

        	html+=body;
        	html+='</body></html>';
        	
        	var printWindow = window.open();
            if (!printWindow) {
                alert("Please allow pop-ups");
            } else {
                printWindow.document.write(html);
                printWindow.print();
                printWindow.close();
            }
        }
        
    });

    return ReviewVerificationRunsOverView;
});