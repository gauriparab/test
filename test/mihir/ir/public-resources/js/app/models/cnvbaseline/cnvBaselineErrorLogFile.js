/*global define:false*/
define(['backbone'], function (Backbone) {
    "use strict";

    var CnvBaselineErrorLogFile = Backbone.Model.extend({
        
        urlRoot : '/ir/secure/api/v40/cnvbaseline/errorlogfile'

    });

    return CnvBaselineErrorLogFile;
});