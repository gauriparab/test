/*global define:false*/
define(['backbone', 'models/sample/barcode'], function (Backbone, Barcode) {
    'use strict';
    var Barcodes = Backbone.Collection.extend({
        model: Barcode,
        url: '/ir/secure/api/samplemanagement/samples/getBarcodes',
        
        initialize: function(options){
        	if(options){
        		this.url = options.url;
        	}
        }
    });
    return Barcodes;
});
