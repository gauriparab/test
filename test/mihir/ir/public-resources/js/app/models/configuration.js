/*global define:false*/
define([ 'underscore', 'backbone' ], function (_, Backbone) {
    "use strict";

    /**
     * <p>
     * Local model to capture configuration properties pulled down from server.
     * </p>
     *
     * @type {*}
     */
    var Configuration = Backbone.Model.extend({

        url: '/ir/configuration/',

        parse: function(res) {
            return _.reduce(res, function(map, v, k) {
                map[k.replace(/application\./, '')] = v;
                return map;
            }, {});
        },

        fetch: function(options) {
            return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
                contentType: 'application/json'
            }));
        },
        
        getAsInt: function(propertyName) {
            var valAsString = this.get(propertyName);
            try {
                return parseInt(valAsString, 10);
            } catch (e) {
                return undefined;
            }
        }

    });

    // initialize and pre-fetch a singleton instance
    var config = new Configuration();
    config.fetch({async: false});
    return config;
});
