/*global define:false */
define(['underscore', 'backbone', 'hb!templates/common/alert-modal.html'],
    function(_, Backbone, template) {
        'use strict';

        /**
         * A Bootstrap modal widget for alerts
         *
         * @type {*}
         */
        var AlertModalView = Backbone.View.extend({

            template: template,

            tagName: 'div',

            className: 'modal',

            events: {
                'click #btn-confirm': '_onConfirm'
            },

            confirmKey: 'confirm.ok',

            initialize: function(options) {
                options = options || {};
                this.headerKey = options.headerKey;
                this.bodyTemplate = options.bodyTemplate;
                this.bodyCtx = options.bodyCtx;
                this.bodyKey = options.bodyKey;
                this.confirmKey = options.confirmKey || this.confirmKey;
                this.modalOptions = options.modalOptions || {};
            },

            delegateEvents: function() {
                Backbone.View.prototype.delegateEvents.apply(this, arguments);
                this.$el.on('hidden', _.bind(this.remove, this));
            },

            render: function() {
                this.$el.html(template(this._json()));
                this.$el.modal(this.modalOptions);
                return this;
            },

            _json: function() {
                return {
                    headerKey: this.headerKey,
                    bodyTemplate: this.bodyTemplate,
                    bodyCtx: this.bodyCtx,
                    bodyKey: this.bodyKey,
                    confirmKey: this.confirmKey
                };
            },

            _onConfirm: function() {
                this.trigger('confirm');
                this._hide();
            },

            _hide: function() {
                this.$el.modal('hide');
            }

        });

        AlertModalView.open = function(success, options, clz) {
            clz = clz || AlertModalView;
            var dialog = new clz(options);
            dialog.on('confirm', success);
            dialog.render();
        };

        return AlertModalView;
    }
);
