/*global define:false*/
define(['jquery', 'underscore',
        'models/analysis/purchase', 'models/analysis/purchaseOrder', 'models/analysis/invoice',
        'views/templateView', 'views/analysis/analysisLaunchConfirmNameView',
        'views/analysis/analysisPurchaseConfirmationView', 'views/loadingView', 'events/eventDispatcher',
        'hb!templates/analysis/analysis-launch-confirm.html', 'hb!templates/error.html'],
    function($, _, Purchase, PurchaseOrder, Invoice, TemplateView, NameView, PurchaseConfirmationView, LoadingView,
            dispatcher, template, errorTemplate) {
        'use strict';

        var ANALYSES_OVERVIEW_URL = '/ir/secure/analyses.html';

        var ConfirmView = TemplateView.extend({

            template: template,

            analysisViews: {},

            _purchaseConfirmationView: null,

            events: {
                'click #launch-analysis-btn:not(.disabled)': 'onLaunchClick'
            },

            initialize: function() {
                this.analyses = [];
                this.analysisViews = {};
                this._purchaseOrder = new PurchaseOrder();
                this._invoice = null;
                if (this.model.get('specimenGroup')) {
                    this.model.autogenerateName();
                    this.analyses.push(this.model);
                } else if (this.model.get('specimenGroups').length) {
                    this.model.get('specimenGroups').each(function(specimenGroup) {
                        var analysis = this.model.clone();
                        analysis.set('specimenGroup', specimenGroup);
                        analysis.autogenerateName();
                        this.analyses.push(analysis);
                    }, this);
                } else {
                    dispatcher.trigger('validate');
                }
            },

            render: function() {
                TemplateView.prototype.render.apply(this, arguments);

                _.each(this.analyses, function(analysis) {
                    var view = new NameView({
                        model: analysis
                    }).render();

                    this.$('#launchAnalyses').append(view.$el);
                    this.analysisViews[analysis.cid] = view;
                }, this);

                var purchasePromise = this._updatePrice();

                if (purchasePromise) {
                    this._displayProcessingInProgress('loading.purchase');
                    $.when(purchasePromise)
                        .done(_.bind(this._successfulPurchase, this))
                        .fail(_.bind(this._failedPurchase, this))
                        .always(_.bind(this._hideProcessingInProgress, this))
                        .always(_.bind(this._enableAnalysisLaunch, this, true));
                }

                return this;
            },

            onSaveSuccess: function() {
                this.$('#error').hide();
                setTimeout(function() {
                    window.location = ANALYSES_OVERVIEW_URL;
                }, 500);

            },

            onLocalValidationError: function(localError) {
                this._enableAnalysisLaunch(true);
                this._showErrorTemplate(localError);

                // each error in allErrors is decorated with the view where the problem ocurred (for highlighting)
                _.each(localError.errors.allErrors, function(error) {
                    var field = _.last(error.defaultMessage && error.defaultMessage.split('.'));
                    error.view.$("[name='" + field + "']").parents('.control-group').addClass('error');
                });
            },

            onRemoteError: function(response) {

                this._enableAnalysisLaunch(true);

                if (!response.responseText) {
                    return;
                }
                var responseError = JSON.parse(response.responseText);

                // defer to global ajax error handling in ir.js
                if (responseError.status > 400) {
                    return;
                }

                // display and highlight errors based on rejected values returned from server...
                if (responseError.errors && responseError.errors.allErrors) {
                    _.each(responseError.errors.allErrors, function(err) {
                        _.each(this.$('.control-group > .controls > input'), function(input) {
                            var $selector = $(input);
                            if ($selector.val() === err.rejectedValue) {
                                $selector.parents('.control-group').addClass('error');
                            }
                        }, this);
                    }, this);
                    this._showErrorTemplate(responseError);
                }
            },


            _showErrorTemplate: function(responseError) {
                // display a single error view, not one for each analysis.
                // hide and show to ensure a visible change in validation
                this.$('.errors').html(errorTemplate(responseError)).hide().show();
            },

            onLaunchClick: function(e) {
                e.preventDefault();

                // clear the errors if a validation error was present...
                this.$('.control-group').has('input').removeClass('error');
                this.$('.errors').empty();

                if (!this._validateInvoiceAndLaunchAnalyses()) {
                    // try again
                    var purchasePromise = this._updatePrice();

                    if (purchasePromise) {
                        this._enableAnalysisLaunch(false);
                        this._displayProcessingInProgress('loading.purchase');
                        $.when(purchasePromise)
                            .done(_.bind(function(response) {
                                this._successfulPurchase(response);
                                this._hideProcessingInProgress();
                                this._validateInvoiceAndLaunchAnalyses();
                            }, this))
                            .fail(_.bind(function(response) {
                                this._failedPurchase(response);
                                this._hideProcessingInProgress();
                            }, this))
                            .always(_.bind(this._enableAnalysisLaunch, this, true));
                    }
                }
            },

            _validateInvoiceAndLaunchAnalyses: function() {
                if (this._invoice) {
                    if (this._validateLocal()) {
                        this._enableAnalysisLaunch(false);
                        if (this._invoice.hasChargeableItems()) {
                            // confirm purchase gets called if validation was successful.
                            this._validateRemote()
                                .done(_.bind(this._confirmPurchase, this))
                                .fail(_.bind(function(response) {
                                    this.onRemoteError(response);
                                }, this));
                        } else {
                            this._launchAllAnalyses();
                        }
                    }
                    return true;
                } else {
                    return false;
                }
            },

            _validateLocal: function() {

                var allErrors = [];
                var names = [];

                // perform local validation and build an error structure similar to an ajax response error.
                _.each(this.analysisViews, function(analysisView) {

                    // perform model validation
                    var bbValidationMsgs = analysisView.model.validate();
                    _.each(bbValidationMsgs, function(msg) {
                        allErrors.push({
                            defaultMessage: msg,
                            view: analysisView
                        });
                    });

                    // check the analysis names locally against each other (multi-sample)
                    var name = analysisView.model.get('name');
                    if (_.contains(names, name)) {
                        allErrors.push({
                            defaultMessage: $.t('analysis.error.duplicate.name'),
                            view: analysisView
                        });
                    } else {
                        names.push(name);
                    }
                });

                if (allErrors.length > 0) {
                    this.onLocalValidationError({
                        message: $.t('exception.msg.public.ValidationException'),
                        errors: {
                            allErrors : allErrors
                        }
                    });
                    return false;
                } else {
                    return true;
                }
            },

            _validateRemote: function() {
                return $.ajax({
                    url: '/ir/secure/api/v40/analysis/validation',
                    type: 'POST',
                    data: JSON.stringify(this._createValidationRequest()),
                    dataType: 'json',
                    contentType: 'application/json',
                    timeout: parseInt($.t('analysis.error.timeout.value'), 10)
                });
            },

            _confirmPurchase: function() {
                var self = this,
                    confirmAndLaunch = function() {
                        self._launchAllAnalyses();
                    };
                if (this._purchaseConfirmationView) {
                    this._purchaseConfirmationView.undelegateEvents();
                }
                this._purchaseConfirmationView = new PurchaseConfirmationView({
                        el: '#confirm-launch-modal',
                        model: this._purchaseOrder,
                        invoice: this._invoice,
                        onConfirm: confirmAndLaunch
                    });
                this._purchaseConfirmationView.render().$el.modal({
                    width: 700,
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true
                });

                this._purchaseConfirmationView.$el.on('hidden', function() {
                    self._enableAnalysisLaunch(true);
                });
            },

            _launchAllAnalyses: function() {
                this._displayProcessingInProgress('loading.launch');
                $.ajax({
                    url: '/ir/secure/api/v40/analysis/launch',
                    type: 'POST',
                    data: JSON.stringify(this._createLaunchRequest()),
                    dataType: 'json',
                    contentType: 'application/json',
                    timeout: parseInt($.t('analysis.error.timeout.value'), 10)
                })
                .done(_.bind(function(data) {
                    _.each(data.analysisList, function(anAnalysis, index) {
                        this.analyses[index].set(anAnalysis, {silent: true});
                    }, this);
                    _.each(this.analysisViews, function(analysisView) {
                        analysisView.success();
                        delete this.analysisViews[analysisView.model.cid];
                    }, this);
                    this.onSaveSuccess();
                }, this))
                .fail(_.bind(function(response) {
                    this.onRemoteError(response);
                }, this))
                .always(_.bind(this._hideProcessingInProgress, this));
            },

            _getAnalysisList: function() {
                return _.map(this.analyses, function(anAnalysis) {
                    return anAnalysis.toSlimJSON();
                });
            },

            _createValidationRequest: function() {
                return {
                    analysisList: this._getAnalysisList()
                };
            },

            _createLaunchRequest: function() {
                var launchRequest = {
                    analysisList: this._getAnalysisList(),
                    invoice: this._invoice.toJSON()
                };
                _.extend(launchRequest.invoice.purchaseOrder, _.omit(this._purchaseOrder.toJSON(), 'cid'));
                return launchRequest;
            },

            _totalNumberOfPlugins: function() {
                return this.analyses.reduce(function(memo, analysis){
                    return memo + (analysis.has('plugins') ? analysis.get('plugins').length : 0);
                }, 0);
            },

            _displayProcessingInProgress: function(bodyKey) {
                this._enableAnalysisLaunch(false);
                this._loadingView = new LoadingView({
                    bodyKey: bodyKey
                }).render({
                    show : true
                });
            },

            _hideProcessingInProgress: function() {
                this._loadingView.hide();
            },

            _updatePrice: function() {
                var purchase = new Purchase();
                return purchase.purchaseAnalyses(this.analyses, this._purchaseOrder);
            },

            _successfulPurchase: function(response) {
                this._invoice = new Invoice(response.invoice || {});
                dispatcher.trigger('change:invoice', this._invoice);
                this.$('input:first').focus();
            },

            _failedPurchase: function(response) {
                this.onRemoteError(response);
            },

            _enableAnalysisLaunch: function(flag) {
                if (flag) {
                    this.$('#launch-analysis-btn').removeClass('disabled');
                } else {
                    this.$('#launch-analysis-btn').addClass('disabled');
                }
            }
        });

        return ConfirmView;

    }
);