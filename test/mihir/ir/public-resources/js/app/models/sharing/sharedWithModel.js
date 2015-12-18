/*global define:false*/
define(['jquery', 'i18n', 'models/baseModel'], function ($, i18n, BaseModel) {
    'use strict';

    var SharedWithModel = BaseModel.extend({

        isNew: function () {
            return this.get('sharedOn') === null || $.trim(this.get('sharedOn')) === '';
        },

        validations: {
        // Email validation will be handled within the service.
        }

    });

    return SharedWithModel;
});