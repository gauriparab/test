/*global define:false */
define(['jquery',
    'i18n',
    'underscore',
    'backbone',
    'views/common/bannersView',
    'hb!templates/common/dialog.html'
].concat('bootstrap', 'bootstrap.modal', 'bootstrap.modalmanager'),
    function($,
             i18n,
             _,
             Backbone,
             BannerView,
             template) {

        'use strict';

        /**
         * A Bootstrap widget for generic modals
         *
         * @type {*}
         */
        var Dialog = Backbone.View.extend({

            tagName: 'div',

            className: 'modal fade',

            closeKey: 'dialog.close',

            _template: template,

            _validOptions: ['id', 'headerKey', 'headerReplacements', 'bodyKey', 'confirmKey', 'closeKey', 'bodyView', 'bodyOpts',
                'confirm', 'idPrefix', 'closeBtnClass', 'confirmBtnClass', 'cancelPrimary', 'autoConfirm', 'autoValidate', 'modalOptions'],

            events: {
                'click [data-button-type="btn-confirm"]': '_onConfirm',
                'click [data-button-type="btn-close"]': '_onHide',
                'keypress': '_onKeyPress'
            },

            initialize: function(options) {
                _.extend(this, _.defaults(_.pick(options || {}, this._validOptions), {
                    autoConfirm: true,
                    autoValidate: true, 
                    modalOptions : {
                        backdrop: 'static',
                        attentionAnimation: null,
                        keyboard: false
                    }
                }));
            },

            delegateEvents: function() {
                Backbone.View.prototype.delegateEvents.apply(this, arguments);
                this.$el.on('hidden', _.bind(this._onHidden, this));
                if (this.bodyOpts.model) {
                    this.bodyOpts.model.on('change', this._onModelChanged, this);
                }
            },

            undelegateEvents: function() {
                if (this.bodyOpts.model) {
                    this.bodyOpts.model.off('change', this._onModelChanged, this);
                }
                this.$el.off('hidden');
                Backbone.View.prototype.undelegateEvents.apply(this, arguments);
            },

            _buttonsJSON: function () {
                var buttons = [];
                var idPrefix = this.idPrefix ? this.idPrefix + '-' : '';
                if (this.closeKey) {
                    buttons.push({
                        idPrefix: idPrefix,
                        btnClass: this.closeBtnClass,
                        buttonKey: this.closeKey,
                        btnType: "btn-close"
                    });
                }
                if (this.confirmKey) {
                    buttons.push({
                        idPrefix: idPrefix,
                        btnClass: this.confirmBtnClass !== undefined ? this.confirmBtnClass : 'btn-primary',
                        buttonKey: this.confirmKey,
                        btnType: "btn-confirm"
                    });
                }
                if (this.cancelPrimary) {
                    buttons = [buttons[1], buttons[0]];
                }
                return buttons;
            },

            render: function() {
                this.$el.html(this._template({
                    headerText: i18n.t(this.headerKey, this.headerReplacements),
                    bodyText: this.bodyKey && i18n.t(this.bodyKey),
                    confirmBtnClass: 'btn-primary',
                    closeBtnClass: this.confirmKey ? '' : 'btn-primary',
                    idPrefix: this.idPrefix ? this.idPrefix + '-' : '',
                    buttons: this._buttonsJSON()
                }));

                if (this.bodyView) {
                    var $el = this.$('.modal-body').empty();
                    this._modalView = new (this.bodyView)(this.bodyOpts || {});
                    this._modalView.setElement($el).render();
                }

                this._onModelChanged();

                this.$el.modal(this.modalOptions);
                return this;
            },

            /**
             * Enable the button that matches the given jquery selector.
             */
            enableButton: function(selector) {
                this.$(selector)
                    .removeClass('disabled')
                    .prop('disabled', false)
                    .removeAttr('title');
                this.$(selector + ' + .icon-loader').remove();
            },
            disableButton: function(selector) {
                this.$(selector)
                    .addClass('disabled')
                    .prop('disabled', true);
            },
            _onHide: function() {
                this.$el.modal('hide');
            },

            _onHidden: function() {
                this.remove();
            },

            _onConfirm: function(e) {
                if (!this.$('[data-button-type="btn-confirm"]').hasClass('disabled')) {
                    this.trigger('confirm', e, this._modalView);
                }
            },

            _onModelChanged: function() {
                if (this.autoValidate && this.bodyOpts.model) {
                    this.$('[data-button-type="btn-confirm"]').toggleClass('disabled', !this.bodyOpts.model.isValid({silent:true}));
                }
            },

            _onKeyPress: function(e) {
                if (this.$('[data-button-type="btn-confirm"]').length && this.autoConfirm && e.keyCode === 13) {
                    this._onConfirm(e);
                }
            }

        });

        Dialog.open = function(dialogOptions, viewOptions, onConfirm) {
            var dialog = new Dialog(_.extend(dialogOptions || {}, {
                bodyOpts: viewOptions || {}
            }));

            dialog.on('confirm', function(e, modalView) {
                // call confirm handler
                var promise = onConfirm(e, modalView);

                if (_.isBoolean(promise)) {
                    if (promise) {
                        dialog._onHide();
                    }
                    return;
                }

                // either it returned a promise, or create a dummy one
                if (!promise || !_.isFunction(promise.then)) {
                    promise = $.when(true);
                }

                promise
                    // on promise resolve, hide dialog
                    .done(function() {
                        dialog._onHide();
                    });
                    // on promise fail, display errors
                	/*.fail(function(resp) {
                        var error = JSON.parse(resp.responseText);
                        if (error && error.status < 500) {
                            jshint nonew:false
                            new BannerView({
                                container: $('.modal-body'),
                                style: 'error',
                                title: error.message,
                                messages:
                                    error.errors &&
                                        error.errors.allErrors &&
                                            _.pluck(error.errors.allErrors, 'defaultMessage')
                            }).render();

                        }
                    });*/
            });

            dialog.render();
            return dialog;
        };

        Dialog.confirm = function(onConfirm, options) {
            return this.open(_.extend(options, {
                confirmKey: 'confirm.yes',
                closeKey: 'confirm.no',
                cancelPrimary: true,
                confirmBtnClass: '',
                closeBtnClass: 'btn-primary'
            }), {}, onConfirm);
        };

        return Dialog;
    }
);
