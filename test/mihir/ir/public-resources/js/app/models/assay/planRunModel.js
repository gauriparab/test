/*global define:false*/
define([
        'models/baseModel',
        'models/common/reasonModel',
        'views/common/auditReasonView'
        ], function(
        	BaseModel,
        	ReasonModel,
        	AuditReasonView) {

    'use strict';
    
    var PlanModel = BaseModel.extend({

        urlRoot : '/ir/secure/api/planrun/getReviewDetails?expId=',

        methodUrl: {
    	    'create': '/ir/secure/api/planrun/createPlanRun',
    	    'update': '/ir/secure/api/planrun/executePlan',
    	    'edit' : '/ir/secure/api/planrun/editPlanRun'
        },
        
        initialize: function(options){
        	var that = this;
        	/*this.needsReason = false;
        	
        	this.reasonModel = new ReasonModel({
        		obj:'Planned Runs'
        	});
        	
        	this.reasonModel.fetch({
        		success:function(){
        			var temp = that.reasonModel.toJSON();
        			that.needsReason = temp.needsReason;
        		}
        	});*/
        	
       		this.planId = (options) ? options.planId : "";
       		this.isEdit = (options) ? options.isEdit : "";
       		if(options){
       			if(options.createUrl){
       				this.methodUrl['create'] = options.createUrl;
       			}
       			if(options.updateUrl){
       				this.methodUrl['update'] = options.updateUrl;
       			}
       		}
        },
        
        url: function(){
    	    return this.urlRoot+this.planId;
        },

		sync: function(method, model, options) {
		    if (model.methodUrl && model.methodUrl[method.toLowerCase()]) {
	      		options = options || {};
	      		options.url = model.methodUrl[method.toLowerCase()];
	      		if(model.isEdit && method.toLowerCase() === 'update'){
	      			options.url = model.methodUrl['edit'];
	      		}
	     	}
		    Backbone.sync(method, model, options);
		}
    });

    return PlanModel;
    
});
