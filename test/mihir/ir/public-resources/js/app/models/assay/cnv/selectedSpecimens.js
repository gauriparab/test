/*global define:false*/
define(['models/baseModel'], function (BaseModel) {
	"use strict";
	var CnvId = 'cnvBaselineId',
		PANELID = 'panelId',
		SELECTED = 'sampleInfoDtoList';
	
	var validationUrl = '/ir/secure/api/cnv/getCnvBaselineSampleValidationValues';
	
	var SelectedSpecimensModel = BaseModel.extend({
		url: '/ir/secure/api/cnv/validateSelectedSamples',
		
		initialize: function(options){
			options = options || {};
			if(options.getValidationParameters){
				this.url = validationUrl;
			}
		},
	    
	    getSampleDto: function(){
    		return this.get(SELECTED);
    	},
    	
    	setSampleDto: function(dto){
    		this.set(SELECTED,dto)
    	},
    	
    	getPanelid: function(){
    		return this.get(PANELID);
    	},
    	
    	setPanelId: function(id){
    		this.set(PANELID,id);
    	},
    	
    	getCnvBaselineId: function(){
    		return this.get(CnvId);
    	},
    	
    	setCnvBaselineId: function(id){
    		this.set(CnvId, id);
    	}
	});

	return SelectedSpecimensModel;
});