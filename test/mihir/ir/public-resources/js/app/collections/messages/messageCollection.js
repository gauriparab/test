/*global define:false*/
define([ 'underscore', 'collections/BaseCollection', 'models/messages/message' ], function(_, BaseCollection, Message) {

	'use strict';

	var MessageCollection = BaseCollection.extend({

        url : '/ir/secure/api/v40/msgs',

        model : Message,

        fetch: function(options) {
            return BaseCollection.prototype.fetch.call(this, _.extend(options || {}, {
                reset: true,
                dataType: 'json',
                contentType: 'application/json'
            }));
        }

	});

	return MessageCollection;
});