/*global define:false*/
define(['jquery',
    'underscore',
    'backbone',
    'models/analysis/analysisModel',
    'collections/common/batchIdentifiables'],

    function(
        $,
        _,
        Backbone,
        Analysis,
        BatchIdentifiables) {

        'use strict';

        /**
         * Batch analyses collection
         *
         * @type {*}
         */
        var BatchAnalyses = BatchIdentifiables.extend({
            url: '/ir/secure/api/v40/analysis/batch',
            model: Analysis
        });

        return BatchAnalyses;

    }
);
