/*global define:false*/
define([ 'collections/BaseCollection', 'models/libraryKitType' ], function(BaseCollection,
                LibraryKitType) {
        "use strict";
        var LibraryKitTypes = BaseCollection.extend({
                model : LibraryKitType,
                url: '/ir/secure/api/assay/kit?type=LibraryKit'
        });

        return LibraryKitTypes;
});

