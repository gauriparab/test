/*global define:false */
define(['underscore', 'backbone', 'views/common/baseModalView', 'hb!templates/common/confirm-modal-footer.html', 'hb!templates/common/audit-modal-reason.html'],
    function(_, Backbone, BaseModalView, footerTemplate, bodyTemplate) {
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
            },

            _options: {
                confirmKey: 'confirm.ok',
                confirmClass: 'btn-primary',
                cancelKey: 'confirm.cancel',
                cancelClass: '',
                confirmId: 'btn-confirm',
				headerKey: 'audit.reason.title',
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true
                },
				bodyTemplate: bodyTemplate
            },

            delegateEvents: function() {
                Backbone.View.prototype.delegateEvents.apply(this, arguments);
                this.$el.on('hidden', _.bind(this.onHide, this));
            },
            undelegateEvents: function() {
                Backbone.View.prototype.undelegateEvents.apply(this, arguments);
            },

            render: function() {
                BaseModalView.prototype.render.apply(this, arguments);
                var jsonOptions = this._json();
                this.$el.find('#modalFooter').html(this.footerTemplate(jsonOptions));
                $(this.$el.find('#reason')).focus();
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

