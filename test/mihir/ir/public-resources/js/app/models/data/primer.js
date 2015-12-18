define(['underscore', 'models/baseModel'], function(_, BaseModel) {

    'use strict';
        
    var Primer = BaseModel.extend({
    	url: "/ir/secure/api/assay/validatePrimerText"
    });

    return Primer;
    
});
