/*global define:false*/
define(['underscore', 'collections/BaseCollection', 'models/variants/variantComment'], function(_, BaseCollection, VariantComment) {
    'use strict';

    var Comments = BaseCollection.extend({

        model : VariantComment,

        initialize: function(models, options) {
            options = options || {};
            this._variantId = options.variantId;
            this.viz = options.viz;
            this.analyses = options.analyses;
        },

        comparator: function(comment) {
            return -(new Date(comment.get('createdOn')));
        },

        url: function() {
            return '/ir/secure/api/v40/variant/' + this._variantId + '/comments?viz=' + this.viz + "&analysisIds=" + this.analyses.getIds();
        },

        parse: function(response) {
            return response.content;
        }
    });

    return Comments;
});