/*global define:false*/
define(['backbone'], function (Backbone) {

    "use strict";

    var PaymentPrefs = Backbone.Model.extend({

        urlRoot: '/ir/secure/api/v40',

        // single model REST paradigm (id is fixed, GET/PUT only)
        idAttribute: "_singleModelId",

        initialize: function() {
            this.id = 'paymentPreferences';
        }
    });

    return PaymentPrefs;
});
