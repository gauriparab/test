/*global define:false */
define(['jquery', 'underscore', 'views/common/confirmModalView'],
       function($, _, ConfirmModalView) {
        'use strict';

        var ConfirmObsoleteAttributeView = ConfirmModalView.extend({
            initialize: function(options) {
                ConfirmModalView.prototype.initialize.call(this, _.extend(options || {}, {
                    bodyKey: 'attribute.obsolete.confirm_message',
                    headerKey: 'attribute.obsolete.confirm',
                }));
            }
        });

        return ConfirmObsoleteAttributeView;

    }
);

