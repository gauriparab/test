/*global define:false*/
define(function() {
    'use strict';

    /**
     * Central registry for plugins.
     *
     * @type {{registry: {}}}
     */
    var PluginRegistry = {
        registry: {},

        register: function(cls) {
            this.registry[cls.PLUGIN_NAME] = cls;
        },

        get: function(pluginName) {
            return this.registry[pluginName];
        }
    };

    return PluginRegistry;
});