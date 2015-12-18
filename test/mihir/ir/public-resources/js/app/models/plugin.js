/*global define:false*/
define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
	'use strict';
	var Plugin = Backbone.Model.extend({
		iconUrl: function() {
			if (this.has('icon')) {
				return '/ir/secure/api/v40/workflow/allowed/plugin/' + this.get('icon').id + '/icon.png';
			} else {
				return '/ir/resources/img/missing-plugin-icon.png';
			}
		},
		
		/*jslint bitwise: false*/
		toJSON: function() {
			var j = _(this.attributes).clone();
			j.iconUrl = this.iconUrl();
			return j;
		},

        purchase: function(analysis, invoice, options) {
            $.ajax({
                url: '/ir/secure/plugins/' + this.id + '/analysis/' + analysis.id + '/purchase',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(invoice.toJSON()),
                success: options.success,
                error: options.error
            });
        }
	});

	return Plugin;
});