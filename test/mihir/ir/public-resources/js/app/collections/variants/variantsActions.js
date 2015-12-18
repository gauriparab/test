/*global define:false*/
define(['underscore', 'collections/BaseCollection'], function(_, BaseCollection) {
    "use strict";
    var VariantsActions = BaseCollection.extend({
        url: '/ir/secure/api/v40/variant/allowed/batchActions',
        
        getActionsForVariants: function(variants, successCallback) {
            this.fetch({
                data: JSON.stringify(variants.map(function(variant) {
                    return {id: variant.id};
                })),
                dataType: 'json',
                type: 'POST',
                contentType: 'application/json',
                error: this.handleError,
                success: successCallback,
                reset: true
            });
            return this;
        }
    });
    return VariantsActions;
});