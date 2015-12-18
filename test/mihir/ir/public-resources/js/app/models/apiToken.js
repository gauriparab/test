/*global define:false*/
define(['backbone'], function (Backbone) {

    "use strict";

    var ApiToken = Backbone.Model.extend({

        urlRoot: '/ir/secure/api/v40',

        // single model REST paradigm (id is fixed, GET/PUT only)
        idAttribute: "_singleModelId",

        initialize: function() {
            this.id = 'apiToken';
        }
    });

    return ApiToken;
});
