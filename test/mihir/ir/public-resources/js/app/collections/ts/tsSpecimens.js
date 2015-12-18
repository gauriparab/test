/*global define:false*/
define(['underscore', 'backbone', 'collections/BaseCollection', 'models/ts/tsSpecimen'],
    function(_, Backbone, BaseCollection, TSSpecimen) {
        'use strict';

        var TSSpecimenCollection = BaseCollection.extend({
            model: TSSpecimen,
        });

        return TSSpecimenCollection;
    });
