/*global define:false*/
define(['underscore', 'backbone', 'data/workflow'], function (_, Backbone, data) {
	"use strict";
	var ApplicationType = Backbone.Model.extend({
		parse : function(response) {
			return data.ApplicationTypes.lookup(response);
		},

        fetch: function(options) {
            return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
                contentType: 'application/json'
            }));
        }
	});

	return ApplicationType;
});