/*global define:false*/
define(['backbone', 'models/sample/sampleType'], function (Backbone, SampleType) {
    'use strict';
    var Barcodes = Backbone.Collection.extend({
        model: SampleType,
	url: '/ir/secure/api/attributes/getSampleTypes'
    });
    return Barcodes;
});