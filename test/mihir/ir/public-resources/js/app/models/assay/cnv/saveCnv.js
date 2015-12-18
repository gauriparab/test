/*global define:false*/
define(['models/baseModel'], function(BaseModel) {
    'use strict';
    var SELECTED = 'sampleInfoDtoList',
    	PANELID = 'panelId',
    	CnvId = 'cnvBaselineId';
    
    var SaveCnvModel = BaseModel.extend({
    	
    	url: '/ir/secure/api/cnv/createCnvBaseline',
    	
    	methodUrl: {
        	'create': '/ir/secure/api/cnv/createCnvBaseline',
            'update': '/ir/secure/api/cnv/editCnvBaseline'
        },
        
        sync: function(method, model, options) {
            if (model.methodUrl && model.methodUrl[method.toLowerCase()]) {
                options = options || {};
                options.url = model.methodUrl[method.toLowerCase()];
            }
		    Backbone.sync(method, model, options);
        },
    	
    	initialize: function(options) {
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
    
    return SaveCnvModel;
});
