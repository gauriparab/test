/*global define:false*/
define([
    'underscore',
    'models/baseModel'
], function(_, BaseModel) {

    'use strict';

    var VariantDetails = BaseModel.extend({
        url: function() {
            return '/ir/secure/api/v40/variant/' +
                this.get('id') +
                '?analysisIds=' +
                this.get('analyses').getIds().join();
        },
        
        areValuesMapType: function(values) {
            return values && values.length && values[0].annotationsMap;
        },
        
        toJSON: function() {
            var json = BaseModel.prototype.toJSON.call(this);
            var self = this;
            // for multi value annotations we need to collect all possible
            // keys and store it as a private property on the annotation.
            // this makes rendering the table easier
            if (json && json.annotations && json.annotations.annotations) {
                _.each(json.annotations.annotations, function(annotation) {
                    if (self.areValuesMapType(annotation.values)) {
                        var allKeys = [];
                        _.each(annotation.values, function(val) {
                            var keys = val.keys;
                            _.each(keys, function(key) {
                                if (!_.where(allKeys, { keyName: key.keyName}).length) {
                                    allKeys.push(key);
                                }
                            });
                        });
                        // then go through each value map, and create an array ordered the same as _keys
                        // this makes rendering easier
                        annotation._keys = allKeys;
                        _.each(annotation.values, function(val) {
                            var valueArray = [];
                            _.each(allKeys, function(key) {
                                valueArray.push({values: [val.annotationsMap[key.keyName]] });
                            });
                            val._values = valueArray;
                        });
                    }
                });
            }
            
            return json;
        }
    });

    return VariantDetails;
});