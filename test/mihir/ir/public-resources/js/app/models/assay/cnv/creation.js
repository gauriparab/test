/*global define:false*/
define(['models/baseModel'], function (BaseModel) {
	"use strict";

	var Evaluation = BaseModel.extend({
		url: '/ir/secure/api/cnv/validateCreationParamters',
		initialize: function(options){
			this.id = options.id;
		},
		fetch: function(options) {
			var that = this;
	        return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
	        	url: '/ir/secure/api/cnv/getCreationParamters?id='+that.id,
	            contentType: 'application/json'
	        }));
	    },
	    
	    getEvaluationParameters: function(){
	    	return this.get(EVALUATION);
	    },
	    
	    setEvaluationParameters: function(params){
	    	this.set(EVALUATION,params);
	    }
	});

	return Evaluation;
});