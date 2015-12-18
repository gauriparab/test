/*global define:false*/
define(['models/baseModel'], function (BaseModel) {
	"use strict";
	
	var MINREADCOUNT = 'minReadCount',
		AMPLICON = 'amplicon',
		ALIGNED = 'aligned';
	
	var Filter = BaseModel.extend({
		url: '/ir/secure/api/cnv/validateCnvFilters',
		
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
	        	url: '/ir/secure/api/cnv/getCnvFilters?id='+ trailor,
	            contentType: 'application/json'
	        }));
	    },
	    
	    getMinReadCount: function(){
	    	return this.get(MINREADCOUNT);
	    },
	    
	    setMinReadCount: function(count){
	    	this.set(MINREADCOUNT,count);
	    },
	    
	    getAmplicons: function(){
	    	this.get(AMPLICON);
	    },
	    
	    setAmplicons: function(amplicon){
	    	this.set(AMPLICON,amplicon);
	    },
	    
	    getAligned: function(){
	    	this.get(ALIGNED);
	    },
	    
	    setAligned: function(aligned){
	    	this.set(ALIGNED,aligned);
	    }
	    
	});

	return Filter;
});