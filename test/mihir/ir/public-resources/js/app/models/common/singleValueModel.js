/*global define:false*/
define([
    'backbone'
], function(
    Backbone
) {
    'use strict';

    var SingleValueModel = Backbone.Model.extend({
        idAttribute: 'value',

        _getValue: function() {
            return this._get('value');
        }
    });

    SingleValueModel.prototype._get = Backbone.Model.prototype.get;
    SingleValueModel.prototype.get = SingleValueModel.prototype._getValue;

    return SingleValueModel;

});