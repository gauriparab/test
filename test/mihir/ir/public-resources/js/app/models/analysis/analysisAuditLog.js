/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'models/baseModel'],
    function($, _, Backbone, BaseModel) {
        'use strict';

        /**
         * Backbone model of an Analysis audit log entity
         *
         * @type {*}
         */
        var AnalysisAuditLog = BaseModel.extend({
            
            urlRoot: '/ir/secure/api/v40/analyses/',
            
            initialize: function(options) {
                this.attributes = this.parse(this.attributes || {});
                this.options = options;
                this.analysisAuditLog = this.options.analysisAuditLog;
                this.url = this.urlRoot + this.analysisAuditLog.audited.id + '/audit_log';
            }
        });
        
        return AnalysisAuditLog;
        
    }
);