/*global define:false*/
define([ 'collections/BaseCollection', 'models/variants/variantsFilterMetrics' ], 
        function(BaseCollection, VariantsFilterMetrics) {

    "use strict";

    var VariantsFilterMetricsCollection = BaseCollection.extend({
        model : VariantsFilterMetrics
    });

    return VariantsFilterMetricsCollection;
});