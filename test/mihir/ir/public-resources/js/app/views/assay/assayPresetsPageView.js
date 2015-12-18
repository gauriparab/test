/* global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'modules/annotationSetModule',
    'modules/filterChainModule',
    'views/assay/annotationSetsView',
    'views/assay/filterChainsView',
    'views/assay/finalReportTemplateView',
    'views/assay/copyNumberBaselineView',
    'views/assay/classificationSetView',
    'views/assay/annotationSetGridView',
    'views/assay/filterChainGridView',
    'views/common/bannersView',
    'events/eventDispatcher',
    'hb!templates/assay/assay-preset-overview.html'
].concat('jqHashChange'),
    function(
        $,
        _,
        Backbone,
        annotationSetModule,
        filterChainModule,
        AnnotationSetsView,
        FilterChainsView,
        FinalReportTemplateView,
        CopyNumberBaselineView,
        ClassificationSetView,
        AnnotationSetPresetsGridView,
        FilterChainPresetsGridView,
        BannerView,
        Dispatcher,
        template) {

	'use strict';

	
    var AssayPreset = Backbone.View.extend({

        _template: template,

        initialize: function(options) {
        	this.showClassificationTab=options.showClassificationTab;
        	this.annotationSetsView = new AnnotationSetsView({
        		showAnnotationSetAddButton:options.showAnnotationSetAddButton
        	});
        	this.filterChainsView = new FilterChainsView();
        	var CNVAuditObject = options.auditConfig['CNV Baseline'];
        	this.copyNumberBaselineView = new CopyNumberBaselineView({
        		canImportCNVBaseline: options.canImportCNVBaseline,
        		canAddCNVBaseline: options.canAddCNVBaseline,
        		needsReason:CNVAuditObject? CNVAuditObject.needsReason : false
        	});
        	this.finalReportTemplateView = new FinalReportTemplateView();
        	this._subViews=[this.annotationSetsView,this.filterChainsView,this.copyNumberBaselineView,this.finalReportTemplateView];
        	if(options.showClassificationTab){
        		this.classificationSetView = new ClassificationSetView();
        		this._subViews.push(this.classificationSetView);
        	}
		this.showFilterChainTab = options.showFilterChainTab;        	
        },
        
        events:{
        	'click #addReportTemplate' : '_showAddReportTemplate',
        	'click #addAnnotationSet' : '_onClickCreateAnnotationSet',
        	'click #addFilterChain': '_onClickCreateFilterChain'
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
        },

        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        _onClickCreateAnnotationSet: function(e) {
            e.preventDefault();
            this._openAnnotationSetModal('CREATE');
        },
        
        _openAnnotationSetModal: function(action, model) {
            var msgKey = model ? 'workflow.annotation.set.successful.modification' 
                               : 'workflow.annotation.set.successful.creation';

            annotationSetModule.initialize({
                model: model,
                modalSelector: '#preset-dialog',
                action: action,
                onComplete: _.bind(this._getCompletePresetModalFunc, this, msgKey, model, 'add:annotationSet')
            });
        },
        
        _onClickCreateFilterChain: function(e) {
            e.preventDefault();

            this._openFilterChainModal('CREATE');
        },

        _openFilterChainModal: function(action, model) {
            var msgKey = model ? 'workflow.filter.chain.successful.modification' 
                               : 'workflow.filter.chain.successful.creation';

            filterChainModule.initialize({
                model: model,
                modalSelector: '#preset-dialog',
                action: action,
                onComplete: _.bind(this._getCompletePresetModalFunc, this, msgKey, model, 'add:filterChain')
            });
        },
        
        _getCompletePresetModalFunc: function(messageKey, model, e) {
            new BannerView({
                container: $('.main-content').first(),
                style: 'success',
                titleKey: messageKey
            }).render();
            Dispatcher.trigger(e);
            if (model) {
                model.trigger('refresh');
            }
        },
        
        render: function() {
        	var that = this;
            this.$el.html(this._template({
            	showClassificationTab:this.showClassificationTab,
		showFilterChainTab:this.showFilterChainTab
            }));
            
            $('#assay-presets-tabs a').on('click',function(){
            	var tab = $(this).data('tab-id');
            	var target = $(this).attr('href');
            	that._subViews[tab].setElement(that.$(target)).render();
            });
            
            if(window.location.hash === '#cnv'){
            	$('#assay-presets-tabs a#cnv').trigger('click');
            } else if(window.location.hash === '#reportTemplate'){
            	$("a[href='#finalReportTemplate']").trigger('click');
        		this._getCompletePresetModalFunc("workflow.final.report.template.successful.creation",null , null);
        		window.location.hash="";
            } else{
            	$('#assay-presets-tabs a:first').trigger('click');
            }

        },
        
        _showAddReportTemplate: function() {
        	window.location = "reportTemplate"
    	}
    	
	
    });

    return AssayPreset;
});
