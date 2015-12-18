/*global define:false*/
define(['jquery',
    'underscore',
    'backbone',
    'models/workflow/workflowModel',
    'collections/common/batchIdentifiables'],

    function(
        $,
        _,
        Backbone,
        Workflow,
        BatchIdentifiables) {

        'use strict';

        /**
         * Batch workflows collection
         *
         * @type {*}
         */
        var BatchWorkflows = BatchIdentifiables.extend({
            url: '/ir/secure/api/v40/workflows/batch',
            model: Workflow
        });

        return BatchWorkflows;

    }
);
