/*global define:false*/
define(['underscore', 'backbone', 'models/sample/term'], function (_, Backbone, Term) {
    'use strict';

    var Terms = Backbone.Collection.extend({
        model: Term,
        comparator: 'fieldOrder'
    });

    return Terms;
});

