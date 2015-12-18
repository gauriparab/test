/*global define:false*/
define(['underscore', 'models/baseModel'], function(_, BaseModel) {

    'use strict';
    
    var Plugins = BaseModel.extend({
    	url:'/ir/secure/api/plugins/executedPlugins?resultId=',
    	initialize:function(options){
    		this.url+=options.id;
    	}
    });

    return Plugins;
    
});
