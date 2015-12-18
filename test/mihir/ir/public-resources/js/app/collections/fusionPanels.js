/*global define:false*/
define([ 'collections/BaseCollection', 'models/fusionPanel' ],
    function(BaseCollection, FusionPanel) {
        "use strict";

        var FusionPanels = BaseCollection.extend({
            model : FusionPanel,
            url: '/ir/secure/api/assay/fusionPanels'
        });

        return FusionPanels;
    });