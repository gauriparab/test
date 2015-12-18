/*global define:false*/
define(['backbone', 'models/sample/assay'], function (Backbone, Assay) {
    'use strict';
    var Assays = Backbone.Collection.extend({
        model: Assay,
        url: '/ir/secure/api/planrun/planRunAssay',
		initialize: function(options){
			if(options && options.url){
				this.url = options.url;
			}
		}
    });
    return Assays;
});