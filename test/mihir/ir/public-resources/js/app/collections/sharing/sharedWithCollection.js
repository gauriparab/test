/*global define:false*/
define(['underscore', 'backbone', 'utils/caches', 'models/sharing/sharedWithModel', 'collections/BaseCollection'],
    function(_, Backbone, Caches, SharedWithModel, BaseCollection) {
    "use strict";

    Caches.collectionCache = {};

    var SharedWithCollection = BaseCollection.extend({
        model: SharedWithModel,

        initialize: function (attributes, options) {
            this.model = options.model || this.model;
            this.url = options.url;
        }

    });

    /**
     * Check if an existing collection for this shared entity exists in the cache and use that one if
     * it exists. Otherwise create a new one with no models.
     *
     * @param sharedId ID of the shared entity
     * @param options for initializing the collection
     */
    SharedWithCollection.constructOrRetrieve = function (sharedId, options) {
        if (Caches.collectionCache[sharedId] === undefined) {
            Caches.collectionCache[sharedId] = new SharedWithCollection([], _.extend({
                sharedId: sharedId
            }, options || {}));
        }
        return Caches.collectionCache[sharedId];
    };

    return SharedWithCollection;
});
