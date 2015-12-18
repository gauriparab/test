/*global define:false*/
define(['jquery', 'underscore', 'views/common/grid/plugins/baseGridPlugin', 'views/common/pluginRegistry'],
    function($, _, BaseGridPlugin, PluginRegistry) {
        'use strict';

        /**
         * This plugin wires up a click event for elements that contain an 'action' data element and
         * triggers a custom event on click.
         *
         * @type {*|void|Object}
         */
        var StatefulGridPlugin = BaseGridPlugin.extend({

            init: function(gridView) {
                BaseGridPlugin.prototype.init.call(this, gridView);

                this._gridView.getState = _.bind(this._getState, this);
                this._gridView.setState = _.bind(this._setState, this);
            },

            _getState: function() {
                return this._gridView._withGrid(function(grid) {
                    return {
                        page: grid.dataSource.page(),
                        pageSize: grid.dataSource.pageSize(),
                        sort: grid.dataSource.sort()
                    };
                });
            },

            _setState: function(state) {
                this._gridView._withGrid(function(grid) {
                    grid.dataSource.query(state);
                });
            }

        });

        StatefulGridPlugin.PLUGIN_NAME = 'stateful';

        PluginRegistry.register(StatefulGridPlugin);

        return StatefulGridPlugin;
    }
);
