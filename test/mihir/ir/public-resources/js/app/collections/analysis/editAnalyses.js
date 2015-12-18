/*global define:false*/
define(['jquery',
    'underscore',
    'backbone',
    'collections/analysis/analyses'],

    function(
        $,
        _,
        Backbone,
        Analyses) {

        'use strict';

        /**
         * Edit analyses collection
         *
         * @type {*}
         */
        var EditAnalyses = Analyses.extend({
            url: '/ir/secure/api/v40/analyses/chromosomes?viz=false&analysisIds='
        });

        return EditAnalyses;

    }
);
