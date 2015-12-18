/*global define:false*/
define(['underscore', 'models/baseModel', 'models/analysis/purchaseOrder'], function(_, BaseModel, PurchaseOrder) {
    "use strict";
    
    var TOTAL_PRICE_ATTR = 'invoiceTotal';
    
    var Invoice = BaseModel.extend({

        constructor: function(attrs, options) {
            BaseModel.call(this, attrs, _.extend(options || {}, {
                parse: true
            }));
        },

        parse: function(res) {
            res.purchaseOrder = res.purchaseOrder instanceof PurchaseOrder &&
                res.purchaseOrder || new PurchaseOrder(res.purchaseOrder);
            return res;
        },

        getTotalPrice: function() {
            return this.get(TOTAL_PRICE_ATTR);
        },
        
        hasChargeableItems: function() {
            var totalPrice = this.getTotalPrice();
            return totalPrice && totalPrice > 0; 
        }

    });
    
    return Invoice;
});
