/*global define:false*/
define(['collections/BaseCollection', 'models/finalReportTemplate'], function(BaseCollection, FinalReportTemplate) {

    "use strict";

    var WorkflowFinalReports = BaseCollection.extend({
        model: FinalReportTemplate,
        
        url: '/ir/secure/api/v40/workflows/reportTemplates',
        
        findByIdOrName: function(id) {
            return this.get(id) || this.findWhere({name: id});
        }
    });

    return WorkflowFinalReports;
});
