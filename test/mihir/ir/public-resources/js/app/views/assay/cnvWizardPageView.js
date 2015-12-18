/*global define:false*/
define(['jquery', 
        'underscore', 
        'models/assay/cnvModel', 
		'wizard/wizard',
		'views/wizard/cnvWizardView',
		'views/assay/confirmCancelCNVModalView',
		'views/workflow/confirmRedirectToPresetsModalView'],
    function($, 
			 _, 
			 CNV, 
			 Wizard, 
			 WizardView, 
			 ConfirmCancelCNV,
			 ConfirmRedirect) {
	
			'use strict';

	var TABS = {
		PANEL : {
			url : '#panel',
			title : $.t('cnv.chevron.tabs.panel'),
			detailsPage : 'views/assay/cnv/panel'
		},
		CREATE : {
			url : '#create',
			title : $.t('cnv.chevron.tabs.setParameters'),
			detailsPage : 'views/assay/cnv/create'
		},
		FILTER: {
			url:'#filter',
			title:($.t('cnv.chevron.tabs.setFilter.title')),
			detailsPage: 'views/assay/cnv/filter'
		},
		SELECT: {
			url : '#samples',
			title : $.t('cnv.chevron.tabs.selectSpecimens'),
			detailsPage : 'views/assay/cnv/selectSamples'
		},
		CONFIRM:{
			url : '#confirm',
			title : $.t('cnv.chevron.tabs.confirmSpecimens'),
			detailsPage : 'views/assay/cnv/confirmSamples'
		}
	};

	_.each(TABS, function(tab, key) {
		tab.identifier = key;
	});
	Object.freeze(TABS);

	var applicationTypeMap = [ TABS.PANEL,TABS.CREATE, TABS.FILTER, TABS.SELECT, TABS.CONFIRM];

	/**
	 * Assay creation wizard page
	 * 
	 * @type {*}
	 */
	var CNVWizardPageView = WizardView.extend({

	    enableResetModules : true,
	
	    initialize : function(options) {
		    _.extend(this, _.pick(options || {}, this._validOptions));

			if(!options.isEdit){
				this.formatJSON();
			}

			this.model = new CNV();
			
			this.model.set('isEdit',options.isEdit || false);
			this.model.set('editData',options.modelData || false);

			options.wizard = new Wizard({
				model : this.model,
				pages : applicationTypeMap,
				cancelPath : '/ir/secure/assay-presets.html#cnv'
			});
		
			if (options.isEdit){
				//TABS.APPLICATION.disabled = true;
				options.wizard.toJSON().steps.setCurrentByName("PANEL");
				options.wizard.toJSON().steps.current().setPrevious(null);
			}
	
			WizardView.prototype.initialize.apply(this,	arguments);
		},
	
		delegateEvents : function() {
			WizardView.prototype.delegateEvents.apply(this, arguments);
			this.on('cancel', this._onCancel);
		},
	
		undelegateEvents : function() {
			this.off('cancel', this._onCancel);
			WizardView.prototype.undelegateEvents.apply(this,arguments);
		},
	
		_onCancel : function(e) {
			e.preventDefault();
			ConfirmCancelCNV.open(function() {
				window.location = '/ir/secure/assay-presets.html#cnv';
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
		}
	});
	
	return CNVWizardPageView;
});