/*global define:false */
define(['jquery', 'underscore', 'views/common/fileValidationModalView', 'views/targetRegionTypes', 'collections/targetRegionTypes', 'hb!templates/upload-target-region-file.html'],
    function($, _, FileValidationModalView, TargetRegionTypesView, TargetRegionTypesCollection, bodyTemplate) {
        'use strict';

        /**
         * A target region file upload dialog
         *
         * @type {*}
         */
        var TargetRegionFileValidationView = FileValidationModalView.extend({
            
            selectedType : '',
            
            DEFAULT_TYPE : 'ION_AMPLISEQ',
            
            
            initialize: function(options) {
                FileValidationModalView.prototype.initialize.call(this, _.extend(options || {}, {
                    bodyTemplate: bodyTemplate,
                    fileElement: '#regionFileUpload',
                    uploadSuccess: _.bind(this.uploadSuccessCallback, this),
                    pollUrl: '/ir/secure/api/v40/targetregions/'
                }));
                _.extend(this, {
                    headerKey: 'targetRegionsFile.custom.upload'
                });  
                this.targetRegionTypes = new TargetRegionTypesCollection();
                
                this.targetRegionTypesView = new TargetRegionTypesView({
                    collection: this.targetRegionTypes,
                    model: this.model,
                    url: '/ir/secure/api/v40/workflows/targetRegionTypes'
                });
                this.events['click #targetRegionType'] = 'onTypeChange';

                this.onUploadSuccess = options.onUploadSuccess;
            },
            
            render: function() {
                FileValidationModalView.prototype.render.apply(this, arguments);
                this.renderSubView(this.targetRegionTypesView, "#targetRegionTypes");
                this.selectedType = this.$('#targetRegionType').val() || this.DEFAULT_TYPE;                
            },
            
            uploadSuccessCallback: function(data) {
                var self = this;
                var targetRegion = {
                        id : data.result.uploadedFile.id,
                        length: data.result.uploadedFile.fileLength,
                        type: self.selectedType,
                        name: data.result.uploadedFile.name
                    };
                if (targetRegion.name.indexOf(".bed")!==-1) {

                    this.$("#validationProgressMessage").html($.t('targetRegionsFile.upload.validating'));
                } 
                else {
                    this.$("#validationProgressMessage").html($.t('specimenFile.upload.validating'));
                }
                $.ajax({
                    url: '/ir/secure/api/v40/targetregions',
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify(targetRegion),
                    success: _.bind(this.pollForSuccess, this),
                    error: _.bind(this._uploadError, this)
                }).done(function(data){
                    if (_.isFunction(self.onUploadSuccess)) { self.onUploadSuccess(data.id); }
                });
            },
            
            onTypeChange: function(e) {
                this.selectedType = $(e.currentTarget).val();
            }
        });

        return TargetRegionFileValidationView;

    }
);
