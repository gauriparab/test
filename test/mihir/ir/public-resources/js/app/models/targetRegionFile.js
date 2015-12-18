/*global define:false*/
define(['underscore', 'backbone'], function (_, Backbone) {
    "use strict";

    var EDIT_ACTION = 'EDIT';

    var TargetRegionFile = Backbone.Model.extend({

        urlRoot : '/ir/secure/api/v40/targetregions',

        initialize: function() {
            this.attributes = this.parse(this.attributes);
        },

        fetch: function(options) {
            return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
                contentType: 'application/json'
            }));
        },

        getPrimaryAction: function() {
            var allActions = this.get('actions');
            if (_.contains(allActions, EDIT_ACTION)) {
                return EDIT_ACTION;
            } else {
                return null;
            }
        }
    });

    return TargetRegionFile;
});