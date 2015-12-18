/*global define:false*/
define(['backbone', 'models/sample/specimenFile'], function (Backbone, SpecimenFile) {
    'use strict';
    var SpecimenFiles = Backbone.Collection.extend({
        model: SpecimenFile
    });
    return SpecimenFiles;
});