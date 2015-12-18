/*global define:false */
define(['underscore', 'backbone', 'views/common/baseModalView', 'hb!templates/common/confirm-modal-footer.html'],
    function(_, Backbone, BaseModalView, footerTemplate) {
        'use strict';

        /**
         * A Bootstrap modal widget for confirmation questions
         *
         * @type {*}
         */
        var ConfirmModalView = BaseModalView.extend({
            footerTemplate : footerTemplate, 
            
            _uiEvents: {
                'click #btn-confirm': '_onConfirm',
                'click #btn-cancel': '_hide'
            },

            _options: {
                confirmKey: 'confirm.yes',
                confirmClass: '',
                cancelKey: 'confirm.no',
                cancelClass: '',
                confirmId: 'btn-confirm',
                modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true
                }
            },

            delegateEvents: function() {
                Backbone.View.prototype.delegateEvents.apply(this, arguments);
                this.$el.on('hidden', _.bind(this.onHide, this));
            },

            render: function() {
                BaseModalView.prototype.render.apply(this, arguments);
                var jsonOptions = this._json();
                this.$el.find('#modalFooter').html(this.footerTemplate(jsonOptions));
                return this;
            },

            _toggleConfirmButton: function(enabled) {
                if (enabled) {
                    this.enableButton(this.$('#btn-confirm'));
                } else {
                    this.disableButton(this.$('#btn-confirm'));
                }
            },

            /**
             * Enable the button that matches the given jquery selector.
             */
            enableButton: function(selector) {
                this.$(selector)
                    .removeClass('disabled')
                    .prop('disabled', false)
                    .removeAttr('title');
            },

            /**
             * Disable the button that matches the given selector.
             * If the button is already disabled then return false.
             * @return true if the button was disabled, false if it was already disabled
             */
            disableButton: function(selector) {
                var element = _.isString(selector) ? this.$(selector) : selector;
                if (element.hasClass('disabled')) {
                    return false;
                }
                element.addClass('disabled')
                    .prop('disabled', true);
                return true;
            }

        });

        return ConfirmModalView;
    }
);
