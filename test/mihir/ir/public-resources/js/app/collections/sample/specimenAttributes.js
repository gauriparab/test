/*global define:false*/
define(['backbone', 'models/sample/specimenAttribute'], function (Backbone, SpecimenAttribute) {
    'use strict';
    var SpecimenAttributes = Backbone.Collection.extend({    	
    	url : '/ir/secure/api/specimen/customAtrribute',
        model: SpecimenAttribute
    });
    return SpecimenAttributes;
});