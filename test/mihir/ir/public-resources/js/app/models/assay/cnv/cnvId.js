/*global define:false*/
define(['models/baseModel'], function(BaseModel) {
    'use strict';
    
    var CnvId = BaseModel.extend({
    	
    	url: '/ir/secure/api/cnv/getAssayId',
    	
    	initialize: function(options) {
    	}
    });
    
    return CnvId;
});
