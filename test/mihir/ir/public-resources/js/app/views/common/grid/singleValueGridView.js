/*global define:false*/
define([
    'underscore',
    'views/common/grid/kendoGridView',
    'models/common/singleValueModel'
].concat(
    'views/common/grid/plugins/multiSelectionGridPlugin'
), function (
    _,
    KendoGridView,
    SingleValueModel
) {
    'use strict';

    var SingleValueGridView = KendoGridView.extend({

        _id: 'value',

        _model: SingleValueModel,

        initialize: function() {
            KendoGridView.prototype.initialize.apply(this, arguments);
            this.loadPlugin('multiSelection');
        },

        _columns: function() {
            return [
                this.cb()
                    .field('value')
                    .title('Value')
                    .width('90%')
                    .build()
            ];
        },

        _parseResponse: function(response) {
            response.content = _.map(response.content, function(value) {
                return {
                    value: value
                };
            });
            response.total = response.total || response.content.length;
            return response;
        }
    });

    return SingleValueGridView;

});