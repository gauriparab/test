/*global define:false */
define(['jquery', 'underscore', 'views/common/confirmModalView', 'hb!templates/assay/cnv/confirm-cancel-cnv.html'],
       function($, _, ConfirmModalView, bodyTemplate) {
        'use strict';

        /**
         * A cancel assay confirmation dialog.
         *
         * @type {*}
         */
        var ConfirmCancelAssayModalView = ConfirmModalView.extend({
            initialize: function(options) {
                ConfirmModalView.prototype.initialize.call(this, _.extend(options || {}, {
                    bodyTemplate: bodyTemplate,
                    headerKey: 'confirm.cancel'
                }));
            }
        });

        return ConfirmCancelAssayModalView;

    }
);
