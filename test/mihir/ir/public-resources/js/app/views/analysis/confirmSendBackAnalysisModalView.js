/*global define:false */
define(['jquery', 'underscore', 'views/common/confirmModalView', 'hb!templates/analysis/confirm-send-back-analysis.html'],
    function($, _, ConfirmModalView, bodyTemplate) {
        'use strict';

        /**
         * A send back analysis confirmation dialog
         *
         * @type {*}
         */
        var ConfirmSendBackAnalysisModalView = ConfirmModalView.extend({
            initialize: function(options) {
                ConfirmModalView.prototype.initialize.apply(this, arguments);
                ConfirmModalView.prototype.initialize.call(this, _.extend(options || {}, {
                    bodyTemplate: bodyTemplate
                }));
                _.extend(this, {
                    headerKey: 'analysis.sendBack.confirm.title'
                });                
            }
        });

        return ConfirmSendBackAnalysisModalView;

    }
);
