/*global define:false*/
define(['backbone'], function (Backbone) {
    "use strict";
    
    var AnalysisErrorLogFile = Backbone.Model.extend({
        
        urlRoot : '/ir/secure/api/v40/analysis/errorlogfile'
            
    });

    return AnalysisErrorLogFile;
});