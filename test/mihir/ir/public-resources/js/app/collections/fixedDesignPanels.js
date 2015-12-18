/*global define:false*/
define([ 'collections/BaseCollection', 'models/fixedDesignPanel' ], function(BaseCollection, FixedDesignPanel) {

    "use strict";

    var FixedDesignPanelsCollection = BaseCollection.extend({
        model : FixedDesignPanel,
        url: '/ir/secure/api/v40/fixedDesignPanels'
    });

    return FixedDesignPanelsCollection;
});