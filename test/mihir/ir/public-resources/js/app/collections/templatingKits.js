/*global define:false*/
define([ 'collections/BaseCollection', 'models/templatingKit' ], function(BaseCollection,
                TemplatingKit) {
        "use strict";
        var TemplatingKits = BaseCollection.extend({
                model : TemplatingKit,
                url: '/ir/secure/api/assay/kit?type=TemplatingKit'
        });

        return TemplatingKits;
});

