/*global define:false*/
define(['models/baseModel'], function(BaseModel) {
    'use strict';
    
    var PanelsModel = BaseModel.extend({
    	
    	url: '/ir/secure/api/cnv/getTargetRegions',
    	
    	initialize: function(options) {
    	}
    });
    
    return PanelsModel;
});
