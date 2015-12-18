/*global define:false*/
define(['underscore', 'backbone'],

    function (_, Backbone) {

        "use strict";

        /* note: only create is actually supported */
        var PaymentAccount = Backbone.Model.extend({
            urlRoot: '/ir/secure/api/v40/paymentAccounts',

            parse : function() {
                return {};
            },

            fetch: function(options) {
                return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
                    contentType: 'application/json'
                }));
            }

        });

        return PaymentAccount;
    });
