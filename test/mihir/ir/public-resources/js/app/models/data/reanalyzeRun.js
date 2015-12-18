/*global define:false*/
define(['underscore', 'models/baseModel'], function(_, BaseModel) {

    'use strict';
    
    var ReanalyzeRun = BaseModel.extend({
    	url: '/ir/analysis/startReanalysis'
    });

    return ReanalyzeRun;
    
});
