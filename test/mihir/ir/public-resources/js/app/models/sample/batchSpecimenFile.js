/*global define:false*/
define(['models/common/uploadImportFile'],
    function (UploadFile) {
    'use strict';

    var BatchSpecimenFile = UploadFile.extend({
        
        url: function() {
            return '/ir/secure/api/v40/batch_samples/' + this.get('id');
        }
    });

    return BatchSpecimenFile;
});

