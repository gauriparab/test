/*global define:false*/
define([ 'jquery', 
         'underscore', 
         'global', 
         'backbone', 
         'views/common/dialog', 
         'views/common/bannersView', 
         'views/loadingView', 
         'views/analysis/analysisErrorLogFileModalView', 
         'hb!templates/sample/import-samples-overview.html', 
         'views/fileUpload'].concat('bootstrap.fileupload'),
    function($, 
    		_, 
    		Global, 
    		Backbone, 
    		Dialog, 
    		BannerView, 
    		LoadingView, 
    		AnalysisErrorLogFileModalView, 
    		template) {
        'use strict';

        /**
         * Import Sample overview page
         *
         * @type {*}
         */

        var importSamplesOverview = Backbone.View.extend({

            _template: template,

            events: {
                'click #removeFile': 'onRemove', 
				'click #download_farmate': 'onDownloadFile',
            },

            render: function() {
                this.$el.html(this._template({defineActions : this.options.defineActions }));
                var self = this;
                var defaultOptions = {
                        autoUpload: false,
                        dataType: 'json',
                        formData: {
                            'X-IonReporter-CSRF-Token': Global.csrfToken
                        },
                        add: function (e, data) {
                            self.$('#upload').unbind();
                            self.$('#upload').click(function (e) {
                                    e.preventDefault();
                                    self.handleUpload();
                                    data.submit();
                                });
                        },
                        progress: function(e, data) {
                            var progress = parseInt(data.loaded / data.total * 100, 10);
                            self._uploadProgress(progress);
                        },
                        done: function(e, data) {
                            self.render();
                            new BannerView({
                                id: 'success-banner',
                                container: $('.main-content>.container-fluid'),
                                style: 'success',
                                static: true,
                                title: $.t('upload.success')
                            }).render();
                        },
                        	fail: function(e, data) {
                        	self.render();
                            self._uploadError(data);
                        }
                    };
                this.$el.find('#regionFileUpload').enhancedFileupload(defaultOptions);
            },

            handleUpload : function() {
                this._resetProgress();
                this.$('.btn-file').hide();
                this.$('#upload').hide();
                this.$('#removeFile').hide();
                this.$('#cancelFileUpload').hide();
                this._uploadStart();
            },
	   
            _resetProgress : function() {
                this._uploadProgress(0);
                this.$('.progress')
                    .removeClass('progress-danger').removeClass('progress-success')
                    .hide();
            },

            _uploadStart : function() {
                this.$('.progress').show();
            },

            _uploadProgress : function(data) {
                this.$('.progress .bar').css("width", data + '%');
                this.$('#progressBar').addClass('active');
            },

            _uploadComplete : function() {
                this.$('.progress').removeClass('progress-striped');
                this.$('#close').show();
            },

            _uploadError : function(data) {
                this.$('.progress').removeClass('progress-striped').addClass('progress-danger');
                this._uploadProgress(100);
                this.$('#close').show();
                if(data.jqXHR.status === 0) {
                	new BannerView({
                        style: 'error',
                        static: true,
                        title: $.t('upload.file.missing') + ". " + $.t('upload.failed')
                    }).render();
                }
            },
		
            onRemove : function() {
                this.$('#upload').unbind();
            },
            
            onDownloadFile : function() {
            	 window.location = "api/specimen/download/file";
            }

        });

        return importSamplesOverview;
    }
);
