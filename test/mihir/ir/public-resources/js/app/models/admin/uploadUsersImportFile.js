/*global define:false*/
define(['models/common/uploadImportFile'], 
    function(UploadImportFile) {
    "use strict";

    var UploadUsersFile = UploadImportFile.extend({
        
        url: function() {
            return '/ir/secure/api/v40/users/file/' + this.get('id'); 
        }
        
    });

    return UploadUsersFile;
});
