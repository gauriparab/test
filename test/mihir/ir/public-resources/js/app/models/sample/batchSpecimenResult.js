/*global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'models/batchresult/BatchResult',
    'models/specimen'
], function(
    $,
    _,
    Backbone,
    BatchResult,
    Specimen) {

    'use strict';

    var BatchSpecimenResult = BatchResult.extend({

        constructor: function(attrs, options) {
            BatchResult.call(this, attrs, _.extend(options || {}, {
                itemModel: Specimen
            }));
        }

    });

    return BatchSpecimenResult;

});
