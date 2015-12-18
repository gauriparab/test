/*global define:false*/
define(['jquery',
        'underscore',
        'backbone',
        'models/specimen',
        'collections/common/batchIdentifiables'],

    function(
        $,
        _,
        Backbone,
        Specimen,
        BatchIdentifiables) {

        'use strict';

        /**
         * Batch specimens collection
         *
         * @type {*}
         */
        var BatchSpecimens = BatchIdentifiables.extend({
            url: '/ir/secure/api/v40/samples/batch',
            model: Specimen
        });

        return BatchSpecimens;

    }
);
