/*global define:false*/
define([ 'jquery', 'underscore', 'backbone' ],
    function($, _, Backbone) {
        'use strict';

        var IRUploader = Backbone.Model.extend({

            getDownloadURL: function() {
                return '/ir/secure/irUploader/download/' + this.attributes.name;
            },

            fetch: function(options) {
                return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
                    contentType: 'application/json'
                }));
            },

            toJSON: function() {
                return _.extend(_.clone(this.attributes), {
                    downloadURL: this.getDownloadURL()
                });
            }

        });

        return IRUploader;
    }
);

