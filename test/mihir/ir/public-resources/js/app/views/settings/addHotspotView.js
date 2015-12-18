/*global define:false*/
define([
        'jquery',
        'underscore',
        'kendo',
        'global',
        'views/formView',
        'views/common/bannersView',
        'models/hotspot',
        'events/eventDispatcher',
        'hb!templates/settings/add-hotspot.html',
        'views/fileUpload'].concat('bootstrap.fileupload'),
        function($,
        		_,
        		kendo,
        		Global,
        		FormView,
        		BannerView,
        		Hotspot,
        		Dispatcher,
        		template) {
            'use strict';

            var AddHotspotView = FormView
                    .extend({
                        el: "#addHotspotModal",
                        initialize: function(options) {
                            options = options || {};
                            this.model = new Hotspot();
                            this.$el.html(template({values:options.references}));
                        },
                        render: function() {
                        	this.$('#hotspotUpload').prop({
				            	'disabled': true,
				            	'title': $.t("upload.file.message")
				            });
                        	
                            var self = this;
                            var defaultOptions = {
                                autoUpload: false,
                                dataType: 'json',
                                formData: {
                                    'X-IonReporter-CSRF-Token': Global.csrfToken
                                },
                                add: function(e, data) {
                                	self.$('#hotspotUpload').removeProp('disabled');
									self.$('#hotspotUpload').removeAttr('title');
                                    self.$('#hotspotUpload').unbind();
                                    self.$('#hotspotUpload').click(function(e) {
                                        e.preventDefault();
                                        var attributes={
            					            	'hotSpotName': self.$("#hotspotName").val(),
            					            	'hotSpotDescription': self.$("#hotspotDescription").val(),
            					            	'reference': self.$("#hotspotReference").val(),
            					            	"fileName": self.$el.find(".fileupload-preview").html()
            					        }
            							$.ajax({
            			                    url: '/ir/secure/api/settings/validateHotspotRegionFile',
            			                    type: 'POST',
            			                    contentType: 'application/json',
            			                    dataType: 'json',
            			                    data: JSON.stringify(attributes),
            			                    success: function() {
	            			                    	self.handleUpload();
	                                                data.submit();
            			                    },
            			                    error: _.bind(self._uploadError, self)
            			                });
                                    });
                                },
                                progress: function(e, data) {
                                    var progress = parseInt(data.loaded
                                            / data.total * 100, 10);
                                    self._uploadProgress(progress);
                                },
                                done: function(e, data) {
                                	var hotspotName 	   = $('#hotspotName').val();
                                	var hotspotReference   = $('#hotspotReference').val();
                                	var hotspotDescription = $('#hotspotDescription').val();

                                    self.model.set("id", data.result.uploadedFile.id);
                                    self.model.set("name", self.$el.find(".fileupload-preview").html());
                                    
                                    self.model.set('hotSpotName',hotspotName);
                                    self.model.set('reference',hotspotReference);
                                    self.model.set('hotSpotDescription',hotspotDescription);
                                    
                                    $.ajax({
                                        url: '/ir/secure/api/settings/createHotspotRegionFile',
                                        type: 'POST',
                                        contentType: 'application/json',
                                        dataType: 'json',
                                        data: JSON.stringify(self.model.toJSON()),
                                        success: _.bind(self._onSaveSuccess, self),
                                        error: _.bind(self._uploadError, self)
                                    }).done(function(data) {
                                        if (_.isFunction(self.onUploadSuccess)) {
                                            self.onUploadSuccess(data.id);
                                        }
                                     });
                                },
                                fail: function(e, data) {
                                    self.render();
                                    self._uploadError(data);
                                    self.$('.btn-file').show();
                                }
                            };
                            this.$el.find('#hotspotFileUpload')
                                    .enhancedFileupload(defaultOptions);

                            this.$el.modal({
                                backdrop: 'static',
                                attentionAnimation: null,
                                keyboard: false,
                                show: true
                            });
                            this.$el.unbind('hide').on('hide', function() {
                                self.unbind();
                            });

                            return this;
                        },
                        events: {
                        },
                        _onSaveSuccess: function(model, data) {
                            this.closeDialog();
                            Dispatcher.trigger('upload:hotspot',{
                                id: 'success-banner',
                                container: $('.main-content'),
                                style: 'success',
                                static: false,
                                title: $.t('upload.success')
                            });
                        },
                        closeDialog: function() {
                            this.$el.modal('hide');
                        },
                        handleUpload: function() {
                            this._resetProgress();
                            this.$('.btn-file').hide();
                            this._uploadStart();
                        },
                        _resetProgress: function() {
                            this._uploadProgress(0);
                            this.$('.progress').removeClass('progress-danger').removeClass('progress-success').hide();
                        },
                        _uploadStart: function() {
                            this.$('.progress').show();
                        },
                        _uploadProgress: function(data) {
                            this.$('.progress .bar').css("width", data + '%');
                            this.$('#progressBar').addClass('active');
                        },
                        _uploadComplete: function() {
                            this.$('.progress').removeClass('progress-striped');
                            this.$('#close').show();
                        },
                        _uploadError: function(data) {
                            this.$('.progress').removeClass('progress-striped').addClass('progress-danger');
                            this._uploadProgress(100);
                            this.$('#close').show();
                        },
                        onRemove: function() {
                            this.$('#hotspotUpload').unbind();
                        }
                    });
                    return AddHotspotView;
                });
