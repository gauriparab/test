/*global define:false*/
define(['models/baseModel'], function (BaseModel) {
	"use strict";
	
	var Evaluation = BaseModel.extend({
		url: '/ir/secure/api/cnv/validateEvaluationParamters',
		
		initialize: function(options){
			this.cnvId = null;
			if(options.id){
				this.cnvId = options.id;
			}
		},
		
		fetch: function(options) {
			var self = this;
			var trailor = '';
			
			if(self.cnvId !== null){
				trailor = self.cnvId;
			}
			
	        return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
	        	url: '/ir/secure/api/cnv/getEvaluationParamters?id='+ trailor,
	            contentType: 'application/json'
	        }));
	    }
	});

	return Evaluation;
});