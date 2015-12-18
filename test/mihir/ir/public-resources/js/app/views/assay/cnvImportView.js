/* global define:false*/
define([
        'jquery',
        'underscore',
        'backbone',
        'global',
        'views/common/bannersView',
		'hb!templates/assay/cnv-import-view.html'
       ].concat('bootstrap.fileupload'),

function(
		$,
		_,
		Backbone,
		Global,
		BannerView,
		template) {
	'use strict';

	var ImportView = Backbone.View.extend({

		_template : template,

		initialize : function(options) {
			options = options || {};
		},

	    events:{
	    	'click #showCnvBaselines':'_showBaselineView'
	    },

		delegateEvents : function() {
			Backbone.View.prototype.delegateEvents.apply(this, arguments);
		},

		undelegateEvents : function() {
			Backbone.View.prototype.undelegateEvents.apply(this, arguments);
		},

		render : function(options) {
			this.$el.html(this._template());
			this._initializeFileUploader();
		},

	    _showBaselineView: function(){
	    	$(this._importEl).css('display','none');
	    	$(this._cnvEl).css('display','block');
	    },

        _initializeFileUploader: function(){
          var self=this;
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
                        self.fileName = data.files[0].name.split('.')[0];
                        data.submit();
                    });
            },
            progress: function(e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                self._uploadProgress(progress);
            },
            done: function(e, data) {
                //self.render();
                new BannerView({
                    id: 'success-banner',
                    container: $('.main-content>.container-fluid'),
                    style: 'success',
                    static: true,
                    title: self.fileName+' '+$.t('cnv.uploadSuccess')
                }).render();
                $('#showCnvBaselines').trigger('click');
            },
            fail: function(e, data) {
            	//self.render({stayOnImportPage:true});
            	self._uploadError(data);
            }
          };
          this.$el.find('#cnvFileUpload').enhancedFileupload(defaultOptions);
        },

        handleUpload : function() {
            this._resetProgress();
            this.$('.btn-file').css('display','none');
            this.$('#upload').css('display','none');
            this.$('#removeFile').css('display','none');
            this.$('#cancelFileUpload').css('display','none');
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
            this.$('#close').css('display','inline-block');
            this.$('.btn-file').css('display','inline-block');
            this.$('#upload').css('display','inline-block');
            this.$('#removeFile').css('display','inline-block');
            if(data.jqXHR.status) {
              new BannerView({
                    style: 'error',
                    static: true,
                    title: $.t('upload.file.missing') + ". " + $.t('upload.failed')
                }).render();
            }
        },

        onRemove : function() {
            this.$('#upload').unbind();
        }
	});

	return ImportView;
});
