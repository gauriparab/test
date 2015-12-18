/*global define:false */
define(['jquery', 'i18n', 'global', 'events/eventDispatcher', 'underscore', 'backbone', 'views/common/baseModalView',
        'hb!templates/common/file-validation-modal-footer.html', 'views/validationErrorsView',
        'models/configuration', 'views/fileUpload']
        .concat('bootstrap.fileupload'),
    function($, i18n, Global, dispatcher, _, Backbone, BaseModalView, footerTemplate, ValidationErrorsView,
             Configuration) {
        'use strict';

        /**
         * A Bootstrap modal widget for file validation
         *
         * @type {*}
         */
        var FileValidationModalView = BaseModalView.extend({

            _pollPromise: null,

            events: {
                'click #btn-confirm': '_onConfirm',
                'click #cancelFileUpload': 'onHide',
                'click #removeFile': 'onRemove',
                'click #close': 'onHide'
            },

            confirmKey: 'confirm.yes',

            initialize: function(options) {
                BaseModalView.prototype.initialize.call(this, _.extend(options || {}, {
                    confirmKey : options.confirmKey || this.confirmKey,
                    onHide : this.onHide,
                    fileElement : options.fileElement,
                    confirmClass: 'btn-primary',
                    modalOptions: {backdrop: "static", attentionAnimation: null, keyboard: false}
                }));
                this.$el.on('hidden', _.bind(this.onHide, this));
                this.POLL_INTERVAL = 2000;
                this.POLL_TIMEOUT = Configuration.getAsInt('pollTimeout.millis.fileValidation');
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
                            self.options.uploadSuccess(data);
                        },
                        fail: function(e, data) {
                            self._uploadError(data);
                        }
                    };
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
                this.$el.modal('hide');
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

                // handle validation errors, let anything else bubble up to ajax error handling in ir.js
                if (data.jqXHR.status <= 400) {
                    var container = $(".modal-body");
                    ValidationErrorsView.show(data.jqXHR, container);
                }
            },

            pollForSuccess : function(data) {
                this.$('#validationProgressMessage').show();
                this.$('#progressBar').removeClass('progress-success').addClass('progress-striped').addClass('active');
                this.executePoll(data.id, 0);
                this._pollPromise = $.Deferred();
                return this._pollPromise;
            },

            executePoll: function(fileId, elapsed) {
                if (elapsed > this.POLL_TIMEOUT) {
                    this.validationTimeout();
                    this.$('.progress').addClass('progress-danger');
                    this._uploadComplete();
                    return;
                }
                var self = this;

                $.ajax({
                    url: this.options.pollUrl + fileId,
                    type: 'GET',
                    success: function(data) {
                        self.handlePollResult(data, fileId, elapsed);
                    },
                    error: function(data) {
                        self.handlePollingError(data);
                    }
                });

            },

            handlePollResult: function(data, fileId, elapsed) {
                var status = this.getValidationStatus(data);
                if (status === 'VALID') {
                    this.handleValidUpload(data);
                } else if (status === 'INVALID') {
                    this.handleInvalidUpload();
                } else {
                    this.handlePendingUpload(fileId, elapsed);
                }
            },

            handleValidUpload: function(data) {
                this.$('.progress').removeClass('active progress-striped').addClass('progress-success');
                this.$('#validationProgressMessage').hide();
                this.$('#validationProgressIcon').hide();
                this.$('.upload-message').text($.t('file.upload.validation.success'));
                this.validationSuccess();
                this._pollPromise.resolve(data);
                this.$('#close').show();
            },

            handleInvalidUpload: function() {
                this.$('.progress').removeClass('progress-striped').addClass('progress-danger');
                this.$('#validationProgressMessage').hide();
                this.$('#validationProgressIcon').hide();
                this.$('.upload-message').text($.t('file.upload.validation.invalid'));
                this.$('#close').show();
            },

            handlePendingUpload: function(fileId, elapsed) {
                var self = this;
                setTimeout(function() {
                    self.executePoll(fileId, elapsed + self.POLL_INTERVAL);
                }, this.POLL_INTERVAL);
            },

            handlePollingError: function(response) {

                this.$('#validationProgressMessage').hide();
                this.$('.progress').addClass('progress-danger').removeClass('progress-striped');
                this.$('.upload-message').text($.t('file.upload.validation.error'));
                this.$('#close').show();

                // handle validation errors, let anything else bubble up to ajax error handling in ir.js
                if (response.status <= 400) {
                    var container = $(".modal-body");
                    ValidationErrorsView.show(response, container);
                }

            },

            validationTimeout: function() {
                this.$('#validationProgressMessage').hide();
                this.$('#validationProgressIcon').hide();
                this.$('#validationTimeout').show();
            },

            validationSuccess: function() {
                this._uploadComplete();
                var self = this;
                this.$('#close').click(function(){
                    self.trigger('confirm');
                });
            },

            onRemove : function() {
                this.$('#upload').unbind();
            },

            getValidationStatus: function(data) {
                return data.validationStatus;
            }

        });

        return FileValidationModalView;
    }
);
