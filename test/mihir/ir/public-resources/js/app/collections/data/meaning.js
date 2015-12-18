/*global define:false*/
define(['backbone', 'models/data/meaning'], function (Backbone, Gender) {
    'use strict';
    var Barcodes = Backbone.Collection.extend({
        model: Gender,
	url: '/ir/secure/api/attributes/getGenders'
    });
    return Barcodes;
});