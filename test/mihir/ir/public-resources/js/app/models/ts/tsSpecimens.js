/*global define:false*/
define(['jquery',
        'underscore',
        'models/baseModel',
        'models/ts/tsLinkedAccount',
        'collections/ts/tsSpecimens'],
    function(
        $,
        _,
        BaseModel,
        TSLinkedAccount,
        TSSpecimensCollection) {

    'use strict';

    var TSSpecimens = BaseModel.extend({

        urlRoot : '/ir/secure/api/v40/tsspecimens/import',

        constructor: function(attrs, options) {
            BaseModel.prototype.constructor.call(this, attrs, _.extend(options || {}, {
                parse: true
            }));
        },

        parse: function(response) {
            if(response) {
                response.linkedAccount = (response.linkedAccount instanceof TSLinkedAccount) ?
                    response.linkedAccount : new TSLinkedAccount(response.linkedAccount);

                response.specimens = (response.specimens instanceof TSSpecimensCollection) ?
                    response.specimens : new TSSpecimensCollection(response.specimens);
            }

            return response;
        },

        validations : {
            // a ts server import must have a single sample selected
            samples: function() {
                if (this.get('specimens').length === 0 ) {
                    return 'ts.samples.error.samples';
                }
            },

            // a ts server import must have a single server selected
            servers: function(options) {
                if(this.get('linkedAccount') && !this.get('linkedAccount').isValid(options)) {
                    return 'ts.samples.error.server';
                }
            }
        }
    });

    return TSSpecimens;
});