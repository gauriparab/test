/*global define:false*/
define(['models/baseModel'], function (BaseModel) {
	"use strict";
	var CnvBaselineType = BaseModel.extend({
        
        parse: function(response) {
            return {
                name: response
            };
        },
        
        toJSON: function() {
            return this.attributes.name;
        }
        
	});

	return CnvBaselineType;
});