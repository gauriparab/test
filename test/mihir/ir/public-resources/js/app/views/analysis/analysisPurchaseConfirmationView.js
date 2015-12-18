/*global define:false*/
define(['underscore', 'kendo', 'models/analysis/purchaseOrder', 'views/templateView', 
        'hb!templates/analysis/analysis-purchase-confirm.html', 'hb!templates/analysis/analysis-purchase-details.html'],
        function(_, kendo, PurchaseOrder, TemplateView, confirmTemplate, purchaseDetailsTemplate) {
    'use strict';

    var PurchaseConfirmationView = TemplateView.extend({

        initialize: function() {
            this.model = this.options.model || new PurchaseOrder();
            this._invoice = this.options.invoice || null;
            this._onConfirm = this.options.onConfirm || null;
            this._onCancel = this.options.onCancel || null;
        },
        
        events: {
            'click #cancel-purchase': '_cancelPurchase',
            'click #confirm-purchase': '_confirmPurchase',
            'keyup #purchase-order-number': '_checkPONumber'
        },
        
        render: function() {
            var invoiceJson = this._invoice.toJSON();
            invoiceJson.items = _.map(invoiceJson.items, function(invoiceItem) {
                return _.defaults({
                    pricePerSKU: this._formatPrice(invoiceItem.pricePerSKU),
                    total: this._formatPrice(invoiceItem.total)
                }, invoiceItem);
            }, this);
            invoiceJson.invoiceTotal = this._formatPrice(invoiceJson.invoiceTotal);
            this.$el.html(confirmTemplate({
                invoice: invoiceJson,
                purchaseOrder: this.model.toJSON(),
                sub: {
                    details: purchaseDetailsTemplate
                }
            }));

            this._checkPONumber();
            return this;
        },
        
        _cancelPurchase: function(e) {
            e.preventDefault();
            if (_.isFunction(this._onCancel)) {
                this._onCancel();
            }
        },
        
        _confirmPurchase: function(e) {
            var poElement = this.$('#purchase-order-number'),
                poNumber = poElement.val();

            e.preventDefault();
            e.stopPropagation();

            if (!poNumber || (_.size(poNumber.trim()) < 1)) {
                this.$("#analysis-purchase-error").removeClass("hide");
                poElement.closest(".control-group").addClass("error");
                return this;
            } else {
                this.$("#analysis-purchase-error").addClass("hide");
                poElement.closest(".control-group").removeClass("error");
            }
            this.model.set({
                number: poNumber
            });
            this.$el.modal("hide");
            if (_.isFunction(this._onConfirm)) {
                this._onConfirm();
            }
        },
        
        _checkPONumber: function(){
            var poElement = this.$('#purchase-order-number'),
                poNumber = poElement.val(),
                cgElement = poElement.closest(".control-group"),
                confirmButton = this.$("#confirm-purchase");

            if (!poNumber || (_.size(poNumber.trim()) < 1)) {
                cgElement.addClass("error");
                confirmButton.addClass("disabled");
            } else {
                cgElement.removeClass("error");
                confirmButton.removeClass("disabled");
            }
        },

        _formatPrice: function(price) {
            return price && kendo.toString(kendo.parseFloat(price, 'en-US'), 'c');
        }
    });
    
    return PurchaseConfirmationView;
});