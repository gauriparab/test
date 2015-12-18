/*global define:false*/
define(['underscore', 'models/baseModel'], function(_, BaseModel) {
    "use strict";

    var BatchAnalysisError = BaseModel.extend({
    });

    BatchAnalysisError.getMessages = function(batchErrors) {
        var result = [];
        if (batchErrors) {
            _.each(batchErrors, function(batchError) {
                if (batchError.messages) {
                    result = result.concat(batchError.messages);
                } else if (batchError.message) {
                    result = result.concat([batchError.message]);
                }
            });
        }
        
        return result;
    };
    
    return BatchAnalysisError;
});
