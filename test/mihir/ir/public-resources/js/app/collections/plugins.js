/*global define:false*/
define([ 'collections/BaseCollection', 'models/plugin' ], function(BaseCollection, Plugin) {
	"use strict";
	var BasePluginsCollection = BaseCollection.extend({
		model : Plugin
	});

	return BasePluginsCollection;
});