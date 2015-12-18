/*global define:false*/
define(['models/baseModel', 'views/common/auditReasonView'], function(BaseModel, AuditReasonView) {

    'use strict';
    
    var Note = BaseModel.extend({
    	
    	initialize:function(options) {
        	this.url = "/ir/secure/api/" + options.entity + "/addNote";
        }
        
    });

    return Note;
});
