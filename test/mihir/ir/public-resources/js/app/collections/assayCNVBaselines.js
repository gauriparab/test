/*global define:false*/
define(['collections/BaseCollection', 'models/cnvBaseline'], function(BaseCollection, CnvBaseline) {

    "use strict";

    var AssayCNVBaselineCollection = BaseCollection.extend({
        model: CnvBaseline,
        url: '/ir/secure/api/cnv/getCnvBaselinePanel?panel_id=',
        initialize: function(options) {
        	this.url=this.url+options.panelId
        }
    }); 

    return AssayCNVBaselineCollection;
});
