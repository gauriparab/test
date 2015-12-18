/*global define:false */
define(['jquery', 'underscore', 'views/common/confirmModalView', 'hb!templates/common/confirm-eula.html'],
    function($, _, ConfirmModalView, template) {
        'use strict';

        /**
         * A EULA confirmation dialog
         *
         * @type {*}
         */
        var ConfirmEULAModalView = ConfirmModalView.extend({

            template: template,

            constructor: function(options) {
                options = options || {};
                ConfirmModalView.prototype.constructor.call(this, _.extend(options, {
                    id: 'confirm-eula-modal'
                }));
            },

            initialize: function(options) {
                options = options || {};
                ConfirmModalView.prototype.initialize.call(this, _.extend(options, {
                    headerKey: 'confirm.eula.title',
                    confirmKey: 'confirm.accept',
                    cancelKey: 'confirm.cancel',
                    confirmClass: 'btn-primary'
                }));
                this._content = options.content;
            },

            render: function() {
                this.$el.html(this.template(this._json()));
                this.$el.modal();
                return this;
            },

            _json: function() {
                var json = ConfirmModalView.prototype._json.apply(this, arguments);
                json.content = this._content;
                return json;
            }

        });

        return ConfirmEULAModalView;
    }
);
