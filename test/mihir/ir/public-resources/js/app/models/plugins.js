/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	
	var ASSAYID = "assayId",
		SELECTEDPLUGINS = 'pluginsDto';
	var Plugins = Backbone.Model.extend({
		url: '/ir/secure/api/assay/validatePlugins',
		initialize:function(options){
			this.assayId = options.assayId;
		},
		fetch: function(options) {
			var self = this;
	        return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
	        	url: '/ir/secure/api/plugins/getAllPlugins?assayId='+self.assayId,
	            contentType: 'application/json'
	        }));
	    },
	    
	    setAssayId: function(assayId) {
        	this.set(ASSAYID, assayId);
        },
        
        getAssayId: function(){
        	return this.getAssayId();
        },
        
        setPlugin : function(plugins){
        	this.set(SELECTEDPLUGINS,plugins);
        }
        
	});
	return Plugins;
});