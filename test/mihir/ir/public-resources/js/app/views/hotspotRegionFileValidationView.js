/*global define:false */
define(['jquery', 'underscore', 'views/common/fileValidationModalView', 'hb!templates/upload-hotspot-region-file.html'],
    function($, _, FileValidationModalView, bodyTemplate) {
        'use strict';

        /**
         * A hotspot region file upload dialog
         *
         * @type {*}
         */
        var HotspotRegionFileValidationView = FileValidationModalView.extend({
            
            initialize: function(options) {
                FileValidationModalView.prototype.initialize.call(this, _.extend(options || {}, {
                    bodyTemplate: bodyTemplate,
                    uploadUrl: '/ir/secure/api/v40/hotspotregions/upload/file',
                    fileElement: '#hotpotUpload',
                    uploadSuccess: _.bind(this.uploadSuccessCallback, this),
                    pollUrl: '/ir/secure/api/v40/hotspotregions/'
                }));
                _.extend(this, {
                    headerKey: 'hotspotRegionsFile.custom.upload'
                });

                this.onUploadSuccess = options.onUploadSuccess;
            },
            
            uploadSuccessCallback: function(data) {
                var self = this;
                var hotspotRegion = {
                        id : data.result.uploadedFile.id,
                        length: data.result.uploadedFile.fileLength,
                        name: data.result.uploadedFile.name
                    };

                $.ajax({
                    url: '/ir/secure/api/v40/hotspotregions',
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify(hotspotRegion),
                    success: _.bind(this.pollForSuccess, this),
                    error: _.bind(this._uploadError, this)
                }).done(function(data){
                    if (_.isFunction(self.onUploadSuccess)) { self.onUploadSuccess(data.id); }
                });
            }
        });

        return HotspotRegionFileValidationView;

    }
);
