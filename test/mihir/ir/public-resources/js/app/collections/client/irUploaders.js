/*global define:false*/
define([ 'jquery', 'underscore', 'backbone', 'models/client/irUploader' ],
    function($, _, Backbone, IRUploader) {
        'use strict';

        var IRUploaders = Backbone.Collection.extend({
            url: '/ir/secure/api/v40/irUploader',

            model: IRUploader,

            fetch: function(options) {
                return Backbone.Collection.prototype.fetch.call(this, _.extend(options || {}, {
                    contentType: 'application/json'
                }));
            }
        });

        return IRUploaders;
    }
);

