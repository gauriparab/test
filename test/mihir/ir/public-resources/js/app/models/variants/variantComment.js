/*global define:false*/
define(['underscore', 'models/baseModel'],
    function(_, BaseModel) {
        'use strict';

        var VariantComment = BaseModel.extend({

            initialize: function(attrs, options) {
                options = options || {};
                this._variantId = options.variantId;
            },

            urlRoot: function() {
                return '/ir/secure/api/v40/variant/' + this._variantId + '/comment';
            },

            validate: function(attrs) {
                var invalid = [];
                if ((_.has(attrs, "message")) && (attrs.message === "")) {
                    invalid.push("message");
                }

                if (invalid.length > 0) {
                    return invalid;
                }
            }


        });

        return VariantComment;
    });