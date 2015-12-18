/*global define:false */
define(['jquery', 'underscore', 'views/common/confirmModalView', 'hb!templates/common/confirm-modal-body.html'],
       function($, _, ConfirmModalView, bodyTemplate) {
        'use strict';

        /**
         * A confirmation dialog.
         *
         * @type {*}
         */
        var ConfirmModalBodyView = ConfirmModalView.extend({
            initialize: function(options) {
                ConfirmModalView.prototype.initialize.call(this, _.extend(options || {}, {
                    bodyTemplate: bodyTemplate,
                    headerKey: options.headerKey,
                    warning: options.warning,
                    description: options.description
                }));
            },

            _json: function() {
                var json = ConfirmModalView.prototype._json.apply(this, arguments);
                json.warning = this.options.warning;
                json.description = this.options.description;
                return json;
            }
        });

        return ConfirmModalBodyView;

    }
);
