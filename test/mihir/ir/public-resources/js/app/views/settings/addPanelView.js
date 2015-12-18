/*global define:false*/
define([ 'jquery',
         'underscore',
         'kendo',
         'global',
         'views/formView',
         'models/panel',
         'events/eventDispatcher',
         'hb!templates/settings/add-panel.html',
         'views/fileUpload'].concat('bootstrap.fileupload'),

		function(
				$,
				_,
				kendo,
				Global,
				FormView,
				Panel,
				Dispatcher,
				template) {
			'use strict';
			var AddPanelView = FormView
					.extend({
						el : "#addPanelModal",

						initialize : function(options) {
							options = options || {};
							this.model = new Panel();
							this.$el.html(template({values:options.references}));
						},

						render : function() {
							
							this.$('#upload').prop({
				            	'disabled': true,
				            	'title': $.t("upload.file.message")
				            });
							var self = this;
							var defaultOptions = {
									autoUpload : false,
									dataType : 'json',
									formData : {
										'X-IonReporter-CSRF-Token' : Global.csrfToken
									},
									add : function(e, data) {
										self.$('#upload').removeProp('disabled');
										self.$('#upload').removeAttr('title');
										self.$('#upload').unbind();
										self.$('#upload').click(function(e) {
											e.preventDefault();
											self.handleUpload();
											data.submit();
										});
									},
									progress : function(e, data) {
										var progress = parseInt(data.loaded / data.total * 100, 10);
										self._uploadProgress(progress);
									},
									done : function(e, data) {
										
										var panelName   = $('#panelName').val();
										var reference   = $('#reference').val();
										var description = $('#description').val();
										
										self.model.set("id", data.result.uploadedFile.id);
										self.model.set("type", "ION_AMPLISEQ");
										self.model.set("name", self.$el.find(".fileupload-preview").html());
										
										self.model.set('targetName', panelName);
										self.model.set('referenceId', reference);
										self.model.set('targetDescription', description);
										
										$.ajax({
						                    url: '/ir/secure/api/settings/createTargetRegionFile',
						                    type: 'POST',
						                    contentType: 'application/json',
						                    dataType: 'json',
						                    data: JSON.stringify(self.model.toJSON()),
						                    success: _.bind(self._onSaveSuccess, self),
						                    error: _.bind(self._uploadError, self)
						                }).done(function(data){
						                    if (_.isFunction(self.onUploadSuccess)) { self.onUploadSuccess(data.id); }
						                });
									},
									fail : function(e, data) {
										self.render();
										self._uploadError(data);
									}
								};
							this.$el.find('#panelFileUpload').enhancedFileupload(defaultOptions);
							
							this.$el.modal({
								//backdrop : 'static',
								attentionAnimation : null,
								keyboard : false,
								show : true
							});
							this.$el.unbind('hide').on('hide', function() {
								self.unbind();
							});
							
							return this;
						},						

						events : {
						},
						_onSaveSuccess : function(model, data) {
							this.closeDialog();
							Dispatcher.trigger('upload:panel',{
								id : 'success-banner',
								container : $('.main-content'),
								style : 'success',
								static : false,
								grid:'panelsView',
								title : $.t('upload.success')
							});
						},

						closeDialog : function() {
							this.$el.modal('hide');
						},

						handleUpload : function() {
							this._resetProgress();
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
						},

						onRemove : function() {
							this.$('#upload').unbind();
						}

					});

			return AddPanelView;
		});
