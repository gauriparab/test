/*global define:false*/
define([ 'underscore', 'collections/BaseCollection', 'models/sample/attribute' ], function(_, BaseCollection, Attribute) {
	'use strict';
	var AttributeCollection = BaseCollection.extend({
        url : '/ir/secure/api/v40/attributes/all',

        model : Attribute,

        fetch: function(options) {
            return BaseCollection.prototype.fetch.call(this, _.extend(options || {}, {
                reset: true,
                dataType: 'json',
                contentType: 'application/json'
            }));
        }

	});

	return AttributeCollection;
});