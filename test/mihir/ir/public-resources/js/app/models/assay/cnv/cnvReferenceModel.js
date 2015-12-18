/*global define:false*/
define(['models/baseModel'], function(BaseModel) {
    'use strict';
    
    var ReferenceModel = BaseModel.extend({
    	
    	url: '/ir/secure/api/cnv/getCnvBaselinePanel?panel_id=',
    	
    	initialize: function(options) {
    		this.url+=options.id
    	}
    });
    
    return ReferenceModel;
});
