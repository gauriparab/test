/*global define:false*/
define(['backbone'], function (Backbone) {
	"use strict";
	var InstrumentLogModel = Backbone.Model.extend({
		urlRoot: '/ir/secure/api/settings/diagnosticLogInit',
		
		initialize: function(options){
        	this.folderPath= options.folderPath;
        	this.name= options.name;
        },
        
        url : function(){
    	      return this.urlRoot+"?folderPath="+this.folderPath+"&name="+this.name;
        }
	});
	return InstrumentLogModel;
});