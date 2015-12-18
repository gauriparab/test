/*global define:false*/
define(['backbone', 'models/sample/cancerType'], function (Backbone, CancerType) {
    'use strict';
    var Barcodes = Backbone.Collection.extend({
        model: CancerType,
	url: '/ir/secure/api/attributes/getCancerTypes'
    });
    return Barcodes;
});