/*global define:false*/
define(
		[ 'jquery', 'underscore', 'global', 'backbone', 'views/common/dialog',
				'views/common/bannersView', 'views/loadingView',
				'views/analysis/analysisErrorLogFileModalView',
				'hb!templates/assay/import-assay-overview.html',
				'views/fileUpload' ].concat('bootstrap.fileupload'),
		function($, _, Global, Backbone, Dialog, BannerView, LoadingView,
				AnalysisErrorLogFileModalView, template) {
			'use strict';

			/**
			 * Import Sample overview page
			 *
			 * @type {*}
			 */

			var importAssayOverview = Backbone.View
					.extend({

						_template : template,

						events : {
							'click #removeFile' : 'onRemove',
							'click #file-data-input':'onSelectFile'
						},

						render : function() {
							this.$el.html(this._template({
								defineActions : this.options.defineActions
							}));
							var self = this;
							var defaultOptions = {
								autoUpload : false,
								dataType : 'json',
								formData : {
									'X-IonReporter-CSRF-Token' : Global.csrfToken
								},
								add : function(e, data) {
									self.$('#upload').unbind();
									self.$('#upload').click(function(e) {
										e.preventDefault();
										self.handleUpload();
										data.submit();
									});
								},
								progress : function(e, data) {
									var progress = parseInt(data.loaded
											/ data.total * 100, 10);
									self._uploadProgress(progress);
								},
								done : function(e, data) {
									self.render();
									self.$('#spinner').css('display','none');
									/*if (data.result.zipFile) {
										self.hidePath();
									} else {
										self.showPath(data.result.logURL);
									}*/
									var statusMessage, statusStyle;
									if (data.result.assayImportSuccess) {
										statusMessage = 'upload.success';
										statusStyle = 'success';
									} else {
										statusMessage = 'upload.failure';
										statusStyle = 'error';

									}
									var anchor = '';
									if(!data.result.zipFile){
										var logFileAPI = '/ir/secure/api/assay/showLogFile?logFilePath='+data.result.logURL;
										anchor = '<a style="margin:0px 0px 0px 10px;" href="'+logFileAPI+'" target="_blank">'+$.t('assay.import.view.log')+'</a>';
									}
									self.bannerView = new BannerView({
										id : 'success-banner',
										container : $('.main-content>.container-fluid'),
										style : statusStyle,
										static : true,
										title : $.t(statusMessage) + anchor
									});
									self.bannerView.render();
								},
								fail : function(e, data) {
									self.render();
									self._uploadError(data);
									self.$('#spinner').css('display','none');
								}
							};
							this.$el.find('#regionFileUpload').enhancedFileupload(defaultOptions);
						},

						handleUpload : function() {
							//this._resetProgress();
							this.$('#spinner').css('display','inline-block');
							this.$('.btn-file').hide();
							this.$('#upload').hide();
							this.$('#removeFile').hide();
							this.$('#cancelFileUpload').hide();
							this._uploadStart();
						},

						_resetProgress : function() {
							this._uploadProgress(0);
							this.$('.progress').removeClass('progress-danger')
									.removeClass('progress-success').hide();
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
							this.$('.progress').removeClass('progress-striped')
									.addClass('progress-danger');
							this._uploadProgress(100);
							this.$('#close').show();
							if (data.jqXHR.status === 0) {
								self.bannerView = new BannerView({
									style : 'error',
									container : $('.main-content>.container-fluid'),
									static : true,
									title : $.t('upload.file.missing') + ". "
											+ $.t('upload.failed')
								});
								self.bannerView.render();
							}
						},

						onRemove : function() {
							this.$('#upload').unbind();
						},
						
						onSelectFile: function(){
							if(this.bannerView){
								this.bannerView.clearBanner();
							} else{
								$('#ajaxerror').remove();
							}
						},

						showPath : function(path) {
							//this.$el.find('#path').html(path);
							//secure/api/assay/showLogFile?logFilePath=
							var anchor = $(
									'<a/>',
									{
										text : $.t('assay.import.view.log'),
										target : '_blank',
										href : '/ir/secure/api/assay/showLogFile?logFilePath='
												+ path
									});
							this.$el.find('#path').append(anchor);
						},

						hidePath : function() {
							this.$el.find('#path').html('');
						}

					});

			return importAssayOverview;
		});
