/*global define:false*/
define(['jquery',
        'underscore',
        'backbone',
        'i18n',
        'views/formView',
        'views/validationErrorsView',
        'models/analysis/sharedAnalysesModel',
        'models/analysis/batchAnalysisError',
        'hb!templates/analysis/batch-analysis-share-modal.html',
        'hb!templates/banner-message.html', 'hb!templates/banner-message-literal.html'].concat('bootstrap.modal', 'bootstrap.modalmanager'),
        function($, _, Backbone, i18n, FormView, ValidationErrorsView, SharedAnalysesModel, BatchAnalysisError, template, bannerTemplate, 
                bannerLiteralTemplate) {
    "use strict";

    var BatchAnalysisShareView = FormView.extend({

        tagName: 'div',

        className: 'modal fade ir-batch-share',

        submitButtonSelector: '#shareAnalysesButton',

        events: {
            'submit form': 'onSave'
        },

        initialize: function(opts) {
            var options = opts || {};
            this._analyses = options.collection;

            this.model = new SharedAnalysesModel({}, {
                sharedEntity: this._analyses
            });

            this.$el.on('hidden', _.bind(this.remove, this));
        },

        render: function() {
            this.$el.html(template());
            this.$el.modal({
                width: 700,
                backdrop: 'static',
                attentionAnimation: null,
                keyboard: false,
                show: true
            });
            return this;
        },

        hide: function() {
            this.$el.modal('hide');
        },

        _updateModelFromDom: function() {
            this.model.setEmail(this.$('#user-email').val());
        },

        save: function() {
            this._removeAnyAjaxErrors();
            this._removeBanner();
            this._updateModelFromDom();
            var emailValidationErrors = this.model.validate();
            if (emailValidationErrors) {
                this._onValidationFailure(emailValidationErrors, bannerTemplate);
            } else {
                this.model.shareWith({
                    success: _.bind(this._success, this),
                    error:  _.bind(this._error, this)
                });
            }
        },

        _success: function(data) {
            if (data && !data.success) {
                this._onBatchFailure(data);
            } else if (_.isFunction(this.options.onSuccess)) {
                this.options.onSuccess(data);
            }
        },

        _error: function(jqxhr) {
            this.enableButton(this.submitButtonSelector);
            if (jqxhr.status <= 400) {
                var clientErrorsDiv = this.$('.modal-body .container-fluid:first');
                ValidationErrorsView.show(jqxhr, clientErrorsDiv);
            }
        },

        _onBatchFailure: function(data) {
            this._onValidationFailure(BatchAnalysisError.getMessages(data.errors), bannerLiteralTemplate);
        },
        
        _onValidationFailure: function(messages, template) {
            this.enableButton(this.submitButtonSelector);
            var banner = template({ style: "error", messages: messages });
            this._displayBanner(banner);
        },

        _removeAnyAjaxErrors: function() {
            this.$("#ajaxerror").remove();
        },

        _removeBanner: function() {
            this.$(".control-group.error").removeClass("error").find("i.icon-warning-sign").remove();
            this.$(".modal-body").children(".alert.alert-error").remove();
        },

        _displayBanner: function(banner) {
            if (this.$(".modal-body").children(".alert.alert-error").length) {
                this.$(".modal-body .alert.alert-error").fadeOut({
                    complete: function() {
                        $(this).replaceWith(banner);
                    }
                });
            } else {
                this.$(".modal-body").prepend(banner);
            }
        }

    });

    return BatchAnalysisShareView;
});