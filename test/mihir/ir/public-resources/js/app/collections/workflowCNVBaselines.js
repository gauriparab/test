/*global define:false*/
define(['collections/BaseCollection', 'models/cnvBaseline'], function(BaseCollection, CnvBaseline) {

    "use strict";

    var WorkflowCNVBaselineCollection = BaseCollection.extend({
        model: CnvBaseline,
        url: '/ir/secure/api/v40/workflows/cnvBaselines'
    });

    return WorkflowCNVBaselineCollection;
});
