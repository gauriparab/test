/*global define:false */
define(['jquery', 'events/eventDispatcher', 'underscore', 'backbone', 'global', 'views/common/baseModalView',
        'hb!templates/common/file-upload-modal-footer.html', 'views/fileUpload'].concat('bootstrap.fileupload'),
    function($, dispatcher, _, Backbone, Global, BaseModalView, footerTemplate) {
        'use strict';

        /**
         * A Bootstrap modal widget for file validation
         *
         * @type {*}
         */
        var FileUploadModalView = BaseModalView.extend({

            events: {
                'click #btn-confirm': '_onConfirm',
                'click #cancelFileUpload': 'onHide',
                'click #removeFile': 'onRemove',
                'click #close': 'onHide'
            },

            confirmKey: 'confirm.yes',

            initialize: function(opts) {
                var options = opts || {};
                this._acceptFileTypes = options.acceptFileTypes;
                BaseModalView.prototype.initialize.call(this, _.extend(options, {
                    confirmKey : options.confirmKey || this.confirmKey,
                    onHide : this.onHide,
                    fileElement : options.fileElement,
                    uploadUrl: options.uploadUrl,
                    confirmClass: 'btn-primary',
                    modalOptions: {backdrop: "static", attentionAnimation: null, keyboard: false}
                }));
                this.$el.on('hidden', _.bind(this.onHide, this));
            },

            delegateEvents: function() {
                Backbone.View.prototype.delegateEvents.apply(this, arguments);
            },

            render: function() {
                BaseModalView.prototype.render.apply(this, arguments);
                var jsonOptions = this._json();
                this.$el.find('#modalFooter').html(footerTemplate(jsonOptions));
                this.$('#'+this.primary).addClass('btn-primary');
                var self = this;
                var defaultOptions = {
                        autoUpload: false,
                        add: function (e, data) {
                            var file = data.files && data.files[0] || null;
                            if (file && self._acceptFileTypes && !self._acceptFileTypes.test(file.name)) {
                                self.$('#upload').attr('disabled', 'disabled');
                                self.$('#invalid-filetype-message').show();
                            } else {
                                self.$('#upload').removeAttr('disabled');
                                self.$('#invalid-filetype-message').hide();
                            }
                            self.$('#upload').unbind();
                            self.$('#upload').click(function (e) {
                                    e.preventDefault();
                                    self.handleUpload();
                                    data.submit();
                                });
                        },
                        dataType: 'json',
                        formData: {
                            'X-IonReporter-CSRF-Token': Global.csrfToken
                        },
                        progress: function(e, data) {
                            var progress = parseInt(data.loaded / data.total * 100, 10);
                            self._uploadProgress(progress);
                        },
                        done: function(e, data) {
                            self._uploadSuccess(data);
                        },
                        fail: function(e, data) {
                            self._uploadError(data);
                        }
                    };
                this.$('#close').hide();
                var uploadOptions = defaultOptions;
                if (this.options.uploadUrl) {
                    _.extend(defaultOptions, {url: this.options.uploadUrl}, uploadOptions);
                }
                this.$el.find(this.options.fileElement).enhancedFileupload(uploadOptions);
                return this;
            },

            _json: function() {
                return _.extend(BaseModalView.prototype._json.call(this), {
                    confirmKey: this.options.confirmKey,
                    headerKey: this.headerKey,
                    bodyTemplate: this.bodyTemplate,
                    bodyCtx: this.bodyCtx,
                    bodyKey: this.bodyKey
                });
            },

            onHide: function(e) {
                e.preventDefault();
                this.hide();
            },
            
            hide: function() {
                this.$el.modal('hide');
            },

            handleUpload : function() {
                this._resetProgress();
                this.$('.btn-file').hide();
                this.$('#upload').hide();
                this.$('#removeFile').hide();
                this.$('#cancelFileUpload').hide();
                this.$('#close').hide();
                this._uploadStart();
            },

            _resetProgress : function() {
                this._uploadProgress(0);
                this.$('.progress')
                    .removeClass('progress-danger')
                    .removeClass('progress-success')
                    .hide();
            },

            _uploadStart : function() {
                this.$('.progress').show();
            },

            _uploadProgress : function(data) {
                this.$('.progress .bar').css("width", data + '%');
            },

            _uploadError : function(data) {
                this._uploadProgress(100);
                this.$('.progress').addClass('progress-danger');
                this.$('.upload-message').text('Error: ' + (data.statusText || 'Unknown'));
                this.$('#close').show();
                this.trigger('uploadError');
            },
            
            _uploadSuccess : function(data) {
                this.$('.progress').removeClass('progress-striped');
                this.$('#close').show();
                this.uploadSuccess(data);
                this.trigger('uploadSuccess');
            },

            onRemove : function() {
                this.$('#upload').removeAttr('disabled');
                this.$('#invalid-filetype-message').hide();
                this.$('#upload').unbind();
            }, 

            uploadSuccess : function() {
                
            }

        });

        FileUploadModalView.open = function(uploadSuccess, uploadError, options, clz) {
            clz = clz || FileUploadModalView;
            var dialog = new clz(options);
            dialog.on('uploadSuccess', uploadSuccess);
            dialog.on('uploadError', uploadError);
            dialog.render();
        };

        return FileUploadModalView;
    }
);
