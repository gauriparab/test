/*global define:false*/
define(['underscore', 'models/baseModel'], function(_, BaseModel) {

    'use strict';
    
    var AuditSampleModel = BaseModel.extend({

        urlRoot : '/ir/secure/api/auditmanagement/sample/getAuditDetails',

	url: function() {
	    return this.urlRoot + "?sampleId=" + this.sampleId + "&revId=" + this.revId + "&actionType=" + this.actionType;
	},
	
	initialize: function(options) {
	    this.sampleId = options.id;
	    this.revId = options.revId;
	    this.actionType = options.actionPerformed;
	}
    });

    return AuditSampleModel;
});