/*global define:false*/
define(['kendo'],
    function(kendo) {
        'use strict';

        /**
         * Base class for grid plugins.
         *
         * @type {*}
         */
        var BaseGridPlugin = kendo.Class.extend({

            _gridView: null,

            init: function(gridView) {
                this._gridView = gridView;
            },

            delegateEvents: function() {
                // empty
            },

            undelegateEvents: function() {
                // empty
            },

            onGridDataBinding: function() {
                // empty
            },

            onGridDataBound: function() {
                // empty
            },

            onGridRefresh: function() {
                // empty
            },

            onGridDestroy: function() {
                // empty
            },

            postProcessColumns: function(cols) {
                return cols;
            }

        });

        return BaseGridPlugin;
    }
);
