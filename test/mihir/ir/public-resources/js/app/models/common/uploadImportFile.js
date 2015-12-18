/*global define:false*/
define(['jquery', 'underscore', 'models/baseModel'], 
    function($, _, BaseModel) {
    "use strict";

    var UploadImportFile = BaseModel.extend({
        
        getValidationStatus: function() {
            return this.get('status');
        },
        
        fetch: function(options) {
            return BaseModel.prototype.fetch.call(this, _.extend({
                url: _.result(this, 'url'),
                type: 'GET',
                contentType: 'application/json',
                reset : true,
                timeout: parseInt($.t('analysis.error.timeout.value'), 10)
            }, options));
        }

    });

    return UploadImportFile;
});
