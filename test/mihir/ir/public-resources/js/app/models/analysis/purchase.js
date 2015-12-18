/*global define:false*/
define(['jquery','underscore', 'models/baseModel'], function($, _, BaseModel) {
    "use strict";
    
    var Purchase = BaseModel.extend({
        
        purchaseAnalyses: function(analyses, purchaseOrder, onSuccess, onError) {
            return this.fetch({
                url: '/ir/secure/api/v40/purchase/analysis',
                data : JSON.stringify(this._createAnalysisPurchaseRequest(analyses, purchaseOrder)),
                dataType : 'json',
                type : 'POST',
                contentType : 'application/json',
                error : onError,
                success : onSuccess,
                reset : true,
                timeout: parseInt($.t('analysis.error.timeout.value'), 10)
            });
        },
        
        _createAnalysisPurchaseRequest: function(analyses, purchaseOrder) {
            return {
                analysisList: _.map(analyses, function(anAnalysis) {
                    return anAnalysis.toSlimJSON();
                }),
                purchaseOrder: purchaseOrder.toJSON()
            };
        }

    });
    
    return Purchase;
});
