/*global define:false*/
define(['jquery',
        'underscore',
        'models/assay/assayModel',
		'models/applicationType',
		'collections/applicationTypes',
		'data/assay',
		'wizard/wizard',
		'views/wizard/wizardView',
		'views/assay/confirmCancelAssayModalView',
		'views/workflow/confirmRedirectToPresetsModalView'],
    function($,
			 _,
			 Assay,
			 ApplicationTypeModel,
			 ApplicationTypesCollection,
			 Constants,
			 Wizard,
			 WizardView,
			 ConfirmCancelAssay,
			 ConfirmRedirect) {

			'use strict';

	var TABS = {
		APPLICATION : {
			url : '#application',
			title : $.t('assay.chevron.tabs.application'),
			detailsPage : 'views/application',
			sidebarPage : 'views/assay/assaySummary'
		},
		PANEL : {
			url : '#panel',
			title : $.t('assay.chevron.tabs.panel'),
			detailsPage : 'views/panel',
			sidebarPage : 'views/assay/assaySummary'
		},
		REAGENT : {
			url : '#reagent',
			title : $.t('assay.chevron.tabs.reagent'),
			detailsPage : 'views/reagent',
			sidebarPage : 'views/assay/assaySummary'
		},
		REFERENCE: {
            url: '#reference',
            title: $.t('assay.chevron.tabs.reference'),
            detailsPage: 'views/reference',
            sidebarPage: 'views/assay/assaySummary'
        },
        GENERICREFERENCE: {
            url: '#genericReference',
            title: $.t('assay.chevron.tabs.genericReference'),
            detailsPage: 'views/genericReference',
            sidebarPage: 'views/assay/assaySummary'
        },
		CONTROLS: {
			url : '#controls',
			title : $.t('assay.chevron.tabs.controls'),
			detailsPage : 'views/controlsView',
			sidebarPage : 'views/assay/assaySummary'
		},
		QC : {
			url : '#qc',
			title : $.t('assay.chevron.tabs.qc'),
			detailsPage : 'views/qcSequencing',
			sidebarPage : 'views/assay/assaySummary'
		},
		PRESETS : {
			url : '#presets',
			title : $.t('assay.chevron.tabs.presets'),
			detailsPage : 'views/presets',
			sidebarPage : 'views/assay/assaySummary'
		},
		CNV:{
			url : '#cnv',
			title : $.t('assay.chevron.tabs.cnv'),
			detailsPage : 'views/cnv',
			sidebarPage : 'views/assay/assaySummary'
		},
		PRIMERS: {
            url: '#primers',
            title: $.t('assay.chevron.tabs.primers'),
            detailsPage: 'views/primersContentView',
            sidebarPage: 'views/assay/assaySummary'
        },
		PARAMETERS : {
			url : '#parameters',
			title : $.t('assay.chevron.tabs.parameters'),
			detailsPage : 'views/parameters',
			sidebarPage : 'views/assay/assaySummary'
		},
		PLUGINS:{
			url : '#plugins',
			title :$.t('assay.chevron.tabs.plugins'),
			detailsPage : 'views/plugins',
			sidebarPage : 'views/assay/assaySummary'
		},
		SAVE : {
			url : '#save',
			title : $.t('assay.chevron.tabs.save'),
			detailsPage : 'views/assay/saveAssay',
			sidebarPage : 'views/assay/assaySummary'
		}
	};

	_.each(TABS, function(tab, key) {
		tab.identifier = key;
	});
	Object.freeze(TABS);

	var applicationTypeMap = {};

	/**
	 * Assay creation wizard page
	 *
	 * @type {*}
	 */
	var AssayWizardPageView = WizardView.extend({

	    enableResetModules : true,

	    initialize : function(options) {
	    	var applicationTypeMap11 = {};
	    	_(options.currentAssayType).each(function(t) {
	    		var identifier = t.identifier;
	    		var assayTabs = [];
	    		_(t.tabs).each(function(tab) {
	    				assayTabs.push(TABS[tab]);	    				
				});
	    		applicationTypeMap[identifier] = assayTabs;
			});

		    _.extend(this, _.pick(options || {}, this._validOptions));
		    //var applicationTypeMap = {};
			TABS.APPLICATION.options = {
				assayTypes : this._initializeApplicationTypes(options.currentAssayType)
			};
			this.formatJSON();
			if (options.isCreateReanalysisAssay || options.isEditAssay || options.isCopyAssay) {
				this.model = new Assay(this.options.modelData, {
					parse : true
				});
				if(options.modelData.runType === 'DNA_RNA'){
					this.model.setApplicationType(options.modelData.runType);
				}
			} else {
				this.model = new Assay();
			}

			this.model.setIsEditAssay(options.isEditAssay);
			this.model.setIsCopyAssay(options.isCopyAssay);
			this.model.set('applicationMode',options.mode);

			if(options.isPluginsEnabled){
				for (var type in applicationTypeMap){
					var len = applicationTypeMap[type].length;
					len-=1;
					applicationTypeMap[type].splice(len,0,TABS.PLUGINS);
				}
			}

      var appType = this.model.getApplicationType();
      
      var cancelPath='/ir/secure/create-assay.html';
      
      if(options.isEditAssay || options.isCopyAssay || options.isCreateReanalysisAssay){
        var _appType = this.options.modelData.applicationType;
        var _appVersion = this.options.modelData.version;
        var templateType = this.options.modelData.parentTemplateType;

        if(_appType === 'DNA' && _appVersion === '4.4' ){
          appType = 'DNA_44';
        }
        if(templateType === 'dna_somatic'){
          appType = 'DNA_SOMATIC';
        }
        
        cancelPath='/ir/secure/assay.html';

      }

			options.wizard = new Wizard({
				model : this.model,
				pages : this.getTabsForType(appType),
				cancelPath : cancelPath
			});

			 if (options.isCreateReanalysisAssay) {
                 TABS.APPLICATION.disabled = true;
                 if(this.model.getApplicationType() !== "METAGENOMICS"){
                         TABS.PANEL.disabled = true;
                         TABS.CONTROLS.disabled = true;
                 }else{
                         TABS.REFERENCE.disabled = true;
                         TABS.PRIMERS.disabled = true;
                 }
                 TABS.REAGENT.disabled = true;
                 if(this.model.getApplicationType() !== "METAGENOMICS"){
                         options.wizard.toJSON().steps.setCurrentByName("QC");
                 }else{
                         options.wizard.toJSON().steps.setCurrentByName("PARAMETERS");
                 }
                 options.wizard.toJSON().steps.current().setPrevious(null);
                 this.model.set("isReanalysisAssay", true);
	         }

	         if (options.isEditAssay || options.isCopyAssay){
	             TABS.APPLICATION.disabled = true;
	             if(this.model.getApplicationType() === "METAGENOMICS"){
	            	 options.wizard.toJSON().steps.setCurrentByName("REFERENCE");
	             } else if (this.model.getApplicationType() === "DNA_GENERIC") {
	            	 options.wizard.toJSON().steps.setCurrentByName("GENERICREFERENCE");	
                 } else {
	                 options.wizard.toJSON().steps.setCurrentByName("PANEL");
	             }
	             options.wizard.toJSON().steps.current().setPrevious(null);
	         }

	         this.model.set('requiresReason',options.auditConfig['Assay'].needsReason);

			WizardView.prototype.initialize.apply(this,	arguments);
		},

		getTabsForType : function(applicationType) {
			return applicationTypeMap[applicationType];;
		},

		delegateEvents : function() {
			WizardView.prototype.delegateEvents.apply(this, arguments);
			//this.listenTo(this.model, 'change:applicationType', this._applicationTypeChanged);
			this.listenTo(this.model, 'change:appTypeVersion', this._applicationTypeChanged);
			this.on('cancel', this._onCancel);
		},

		undelegateEvents : function() {
			this.off('cancel', this._onCancel);
//			this.stopListening('change:applicationType');
			this.stopListening('change:appTypeVersion');
			WizardView.prototype.undelegateEvents.apply(this,arguments);
		},

		_applicationTypeChanged : function() {
			this._wizard.set('pages', this.getTabsForType(this.model.get('appTypeVersion')));
		},

		_initializeApplicationTypes : function(assayTypesData) {
			var applicationTypeCollections = [];
			_(assayTypesData).each(function(t) {
				applicationTypeCollections.push(new ApplicationTypeModel(t));
			});

			return new ApplicationTypesCollection(applicationTypeCollections);
		},


		_onCancel : function(e) {
			e.preventDefault();
			ConfirmCancelAssay.open(function() {
				$.ajax({
                 	url: '/ir/secure/api/assay/resetAssay',
                 	type: 'GET',
                 	contentType: 'application/json',
                 	success: function() {
                 		location.pathname = $(e.currentTarget).attr('href');
                 	}
                });				
			});
		},

		presetsRedirect : function(e) {
			if (e.ctrlKey || e.shiftKey) {
				return;
			}
			e.preventDefault();

			ConfirmRedirect.open(function() {
				location.pathname = $(e.currentTarget).attr('href');
			});
		},

		stopModuleMonitoring : function() {
			this.enableResetModules = false;
		},

		startModuleMonitoring : function() {
			this.enableResetModules = true;
		},

		formatJSON: function() {
			var self = this;
			var keys = _.keys(this.options.modelData);
			keys = _.filter(keys, function(key){return key.indexOf("Dto") > 0;});
			_.each(keys, function(key){
				if(self.options.modelData[key]){
					var subKeys = _.keys(self.options.modelData[key]);
					_.each(subKeys, function(subKey){
						if(self.options.modelData[key][subKey]){
							self.options.modelData[subKey] = self.options.modelData[key][subKey];
						}
					});
				}
				delete self.options.modelData[key];
			});
			if(this.options.modelData && this.options.modelData.pluginDtoList){
				this.options.modelData.pluginsDto = this.options.modelData.pluginDtoList;
				delete this.options.modelData.pluginDtoList;
				var selectedPlugins = _.filter(this.options.modelData.pluginsDto, function(data) { return data.isSelected;});
                if(this.options.modelData.pluginsDto.length === 0 || selectedPlugins.length === 0){
                	this.options.modelData.pluginsDto = {};
                    this.options.modelData.pluginsDto.warning = $.t('assay.summary.noplugins');
                }
			}
		}

	});

	return AssayWizardPageView;
});
