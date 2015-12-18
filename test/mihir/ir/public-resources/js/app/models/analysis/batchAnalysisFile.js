/*global define:false*/
define(['models/common/uploadImportFile'], 
    function(UploadFile) {
    "use strict";

    var BatchAnalysisFile = UploadFile.extend({

        url: function() {
            return '/ir/secure/api/v40/batch_analysis/batch_analysis_file/' + this.get('id');
        }
    });
        
    return BatchAnalysisFile;
});
