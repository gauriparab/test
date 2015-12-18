/*global define:false*/
define(['jquery', 'underscore', 'views/common/grid/plugins/baseGridPlugin', 'views/common/pluginRegistry'],
    function($, _, BaseGridPlugin, PluginRegistry) {
        'use strict';

        /**
         * Grid plugin that initializes a bootstrap tooltip on any element that has data element
         * toggle='tooltip'.
         *
         * @type {*|void|Object}
         */
        var TooltipsGridPlugin = BaseGridPlugin.extend({

            onGridDataBinding: function() {
                this._gridView.$('[data-toggle=tooltip]').tooltip('destroy');
            },

            onGridDataBound: function() {
                this._gridView.$('[data-toggle=tooltip]').tooltip();
            }

        });

        TooltipsGridPlugin.PLUGIN_NAME = 'tooltips';

        PluginRegistry.register(TooltipsGridPlugin);

        return TooltipsGridPlugin;
    }
);
