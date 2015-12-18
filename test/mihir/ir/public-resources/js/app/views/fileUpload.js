/*global define:false*/
define(['jquery', 'underscore', 'global', 'ajaxError', 'i18n',
        'models/configuration',
        'views/templateView',
        'views/common/bannersView',
        'views/validationErrorsView',
        'hb!templates/file-upload.html']
        .concat('bootstrap.fileupload', 'jqFileUpload', 'jqIframe'),
        function($, _, Global, AjaxError, i18n, Configuration, TemplateView, BannerView, ValidationErrorsView, template) {
        'use strict';

        /**
         * Extend the blueimp.fileupload widget in order to add a custom _onDone
         * callback that handles iframe transport errors.
         *
         * When using the iframe transport the http status code is unretrievable.
         * In order to determine the actual status of the file upload response, we need
         * to inspect the actual message. If the status is 500 we reroute to the onFail
         * handler.
         */
        $.widget('custom.enhancedFileupload', $.blueimp.fileupload, {
            options: {
                // this is the same behavior defined in jquery.fileUploads.js, but it needs to
                // be overridden to use 'enahancedFileupload' instead of 'fileupload'
                add: function (e, data) {
                    if (data.autoUpload || (data.autoUpload !== false &&
                            $(this).enhancedFileupload('option', 'autoUpload'))) {
                        data.process().done(function () {
                            data.submit();
                        });
                    }
                }
            },
            _onDone: function (result, textStatus, jqXHR, options) {
                // this case should only occur when using iframe transport.
                if (!result || (result.status >= 400 || result.success === false)) {
                    if (result) {
                        jqXHR.status = result.status;
                        jqXHR.responseText = JSON.stringify(result);
                        options.result = result;
                    }
                    else {
                        // in cases where the iframe contents can not be retrieved (AccessDenied due to IE issues)
                        // we just set the status to 500
                        jqXHR.status = 500;
                        jqXHR.statusText = i18n.t('upload.failed');
                    }
                    if (jqXHR.status > 400) {
                        AjaxError.showGlobalError(jqXHR);
                    }
                    this._onFail(jqXHR, 'error', 'Invalid Server Error', options);
                } else {
                    this._superApply(arguments);
                }
            }
        });

        /**
         * FileUpload widget.
         * Creates a file input and a 'browse' button.
         * Uses jqFileUpload to send the file, and then poll for a validation response.
         * Updates the status with a progress bar and various validation messages.
         * For validation polling, this requires a FileModel object implementing:
         *      getValidationStatus()
         *      getStatus()
         */
        var FileUpload = TemplateView.extend({
            template: template,

            events: {
                'click .btn-upload': '_handleFileUpload',
                'change.fileupload :file': '_onFileChanged'
            },

            /**
             * Valid Options:
             *  contextHelp - A Text / HTML string with the contextual help for the file upload
             *  uploadUrl - the URL where the file should be uploaded to.
             *  uploadTimeout - the Timeout to wait before treating the upload as a failure.
             *  pollingInterval - the interval between checking for an updated status.
             *  paramName - the parameter for the file upload widget
             *  validatingMessageKey - The key to be looked up and displayed while validating.
             *  timeoutMessageKey - The key to be looked up and displayed when the upload times out.
             *  invalidFileMessageKey - The key to be looked up and displayed whn the file is invalid.
             *  statusErrorMessageKey - The message key to be looked up and displayed when an error occurs.
             *  errorBannerId - the HTML ID to be used when displaying Banner messages.
             *  model - the Base model class that will be what comes back after the upload and will check the
             *      validation status (subclass of models/common/uploadImportFile.js).
             */
            defaultOptions: {
                contextHelp: '',
                uploadUrl: '',
                pollingInterval: 500, // 500ms
                paramName: 'fileData',
                validatingMessageKey: 'upload.validating',
                timeoutMessageKey: 'upload.validation.timeout',
                invalidFileMessageKey: 'upload.invalid.file',
                statusErrorMessageKey: 'upload.failed',
                errorBannerId: 'error-banner'
            },

            initialize: function(opts) {
                var options = _.defaults(opts || {}, this.defaultOptions);
                _.extend(this, options);
                this._fileUploadModel = this.model;
                _.bindAll.apply(this, [this].concat(_.chain(this).functions().filter(function(val) {
                    return val.indexOf('_on') === 0;
                }).value()));
                this.on('uploadStart', this._onUploadStart);
                this.on('uploadProgress', this._onUploadProgress);
                this.uploadTimeout = Configuration.getAsInt('pollTimeout.millis.fileValidation') || 60000;
            },

            _handleFileUpload: function(e) {
                e.preventDefault();
                var paramName = this.options.paramName,
                    fileUploadEl = this.$('.fileupload'),
                    fileInputEl = this.$('input[name=' + paramName + ']');

                this._displayValidationProgress(false);

                fileUploadEl.enhancedFileupload({
                    autoUpload: false,
                    replaceFileInput: false,
                    paramName: paramName,
                    url: this.uploadUrl,
                    dataType: 'json',
                    formData: {
                        'X-IonReporter-CSRF-Token': Global.csrfToken
                    },
                    progress: this._onUploadProgress,
                    done: _.bind(this._onUploadSuccess, this),
                    fail: _.bind(this._onUploadError, this)
                });

                fileUploadEl.enhancedFileupload('send', {
                    fileInput: fileInputEl,
                    // global error handling should be enabled.
                    noGlobalErrorHandler: false
                });

                this.trigger('uploadStart');
            },

            _onUploadProgress: function(data) {
                var progress = _.isObject(data) ? parseInt(data.loaded / data.total * 100, 10) : data;
                this.$('.progress .bar').css("width", progress + '%');
            },

            _onUploadStart: function() {
                this._enableButtons(false);
                this._displayValidationTimedOut(false);
                this._onUploadProgress(0);
                this.$('.progress')
                    .removeClass('progress-danger')
                    .removeClass('hide');
            },

            _onUploadSuccess: function(evt, data) {
                this._onUploadProgress(100);
                this._beginFileValidation();
                this._fileUploadModel.set(data.result.uploadedFile);
                this._nStatusChecks = 0;
                this._checkUploadStatus();
            },

            _onUploadError: function(evt, data) {
                var response = data ? data.jqXHR : null;
                this.$('.progress')
                    .addClass('progress-danger')
                    .removeClass('progress-success progress-striped');
                this._onUploadProgress(100);

                this._displayValidationProgress(false);
                this._displayUploadError(true);

                // handle validation errors, let anything else bubble up to ajax error handling in ir.js
                if (response && response.status <= 400) {
                    ValidationErrorsView.show(response);
                }

                // re-enable buttons after an error detected so we may change the input file
                this._enableButtons(true);

                this.trigger("upload:uploadError", this._fileUploadModel);
            },

            _beginFileValidation: function() {
                this._elapsedValidation = 0;
                this.$('.progress').addClass('progress-striped active');
                this._displayValidationProgress(true);
            },

            _validationComplete: function() {
                this._enableButtons(true);
                this.$('.fileupload').bsFileupload('reset');
                this.$('.progress').removeClass('active progress-striped').addClass('hide');
                BannerView.clear('#' + this.errorBannerId);
                this._displayValidationProgress(false);
            },

            _validationTimedOut: function() {
                this._displayValidationTimedOut(true);
                this._displayValidationProgress(false);
            },

            _displayUploadError: function(show) {
                this.$('.upload-failed-message').toggleClass('hide', !show);
            },

            _displayValidationProgress: function(show) {
                this.$('.validation-progress-message').toggleClass('hide', !show);
            },

            _displayValidationTimedOut: function(show) {
                this.$('.validation-timeout').toggleClass('hide', !show);
            },

            _enableButtons: function(enable) {
                // the file input can only be disabled if xhrFileUpload is supported.
                // w/out xhrFileUpload, jquery.iframe-transport is used. The iframe transport
                // starts on a delay, so disabling the input here would result in it not being submitted
                // with the eventual form submission
                if ($.support.xhrFileUpload  || enable) {
                    this.$('input').prop('disabled', !enable);
                }
                this.$('button').prop('disabled', !enable);
                this.$('span.btn-file').toggleClass('disabled', !enable);
            },

            _checkUploadStatus: function() {
                switch(this._fileUploadModel.getValidationStatus()) {
                case 'PENDING':
                case 'VALIDATING':
                    if (this.uploadTimeout > 0 && this._elapsedValidation < this.uploadTimeout ||
                        this._elapsedValidation === 0) {
                        // there is no infinite timeout - if no timeout has been specified
                        // execute once and then if the status is still pending timeout.
                        this._doPoll();
                        this._elapsedValidation += this.pollingInterval;
                    } else {
                        this._validationTimedOut();
                        this._onUploadError();
                        this.trigger("upload:uploadFailed", this._fileUploadModel);
                    }
                    break;
                case 'VALID':
                    this._validationComplete();
                    this.trigger("upload:validationSuccessful", this._fileUploadModel);
                    break;
                case 'INVALID':
                    this._validationComplete();
                    this._onInvalidStatusFile();
                    this.trigger("upload:validationFailed", this._fileUploadModel);
                    break;
                default:
                    if (this._nStatusChecks === 0) {
                        // if it's the first status check after an upload
                        // check the status one more time
                        this._doPoll();
                    } else {
                        // otherwise fail
                        this._validationComplete();
                        this._onUploadError();
                        this.trigger("upload:uploadFailed", this._fileUploadModel);
                    }
                }
            },

            _doPoll: function() {
                setTimeout(this._onPoll, this.pollingInterval);
            },

            _onPoll: function() {
                this._fileUploadModel.fetch({
                    success: this._onSuccessfulFetchStatus,
                    error: this._onUploadError
                });
            },

            // Continue polling
            _onSuccessfulFetchStatus: function(model, response) {
                this._fileUploadModel.set(response);
                this._checkUploadStatus();
            },

            // Validation Fail: invalid file
            _onInvalidStatusFile: function() {
                this._onUploadError();
                BannerView.show({
                    id: this.errorBannerId,
                    style: 'error',
                    static: true,
                    titleKey: $.t(this.invalidFileMessageKey)
                });
            },

            // On change of input file, hide progress bar and clear any displayed errors
            _onFileChanged: function() {
                this.$('.progress').addClass('hide');
                this.$('.upload-message').empty();
                this.$('.validation-progress-message').addClass('hide');
                this.$('.upload-failed-message').addClass('hide');
                this.$('.validation-timeout').addClass('hide');

                $('.main .container-fluid:first .alert-error').remove();
                $('.main .container-fluid:first #ajaxerror').empty();
                $('.main .container-fluid:first .alert-success').remove();
            }
        });

        return FileUpload;
    }
);
