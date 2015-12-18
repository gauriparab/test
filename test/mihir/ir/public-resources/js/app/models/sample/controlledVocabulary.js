/*global define:false*/
define([ 'underscore',
         'models/baseModel',
         'collections/sample/terms'],
    function (_,
              BaseModel,
              Terms) {
        'use strict';

        var ControlledVocabulary = BaseModel.extend({

            constructor: function(attributes, options) {
                BaseModel.prototype.constructor.call(this, attributes, _.extend(options || {}, {
                    parse: true
                }));
            },

            parse: function(response) {
                response.terms =
                    response.terms instanceof Terms &&
                        response.terms || new Terms(response.terms);
                return response;
            }

        });

        return ControlledVocabulary;
    }
);

