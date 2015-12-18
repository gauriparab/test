/*global define:false */
define(['jquery', 'underscore', 'views/common/confirmModalView'],
       function($, _, ConfirmModalView) {
        'use strict';

        var ConfirmActivateAttributeView = ConfirmModalView.extend({
            initialize: function(options) {
                ConfirmModalView.prototype.initialize.call(this, _.extend(options || {}, {
                    bodyKey: 'attribute.activate.confirm_message',
                    headerKey: 'attribute.activate.confirm',
                }));
            }
        });

        return ConfirmActivateAttributeView;

    }
);

