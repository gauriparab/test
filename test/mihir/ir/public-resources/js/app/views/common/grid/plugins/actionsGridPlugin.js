/*global define:false*/
define(['jquery', 'underscore', 'views/common/grid/plugins/baseGridPlugin', 'views/common/pluginRegistry'],
    function($, _, BaseGridPlugin, PluginRegistry) {
        'use strict';

        var ACTION = 'action';

        /**
         * This plugin wires up a click event for elements that contain an 'action' data element and
         * triggers a custom event on click.
         *
         * @type {*|void|Object}
         */
        var ActionsGridPlugin = BaseGridPlugin.extend({

            delegateEvents: function() {
                this._gridView.$el.on('click', 'tr [data-action]', _.bind(this._onActionClicked, this));
            },

            undelegateEvents: function() {
                this._gridView.$el.off('click', 'tr [data-action]');
            },

            _onActionClicked: function(e) {
                var el = $(e.currentTarget),
                    action = ACTION + ':' + el.data('action'),
                    data = this._gridView._toModel(el);
                e.preventDefault();
                if (this._gridView.eventDispatcher) {
                    this._gridView.eventDispatcher.trigger(action, e, data);
                } else {
                    this._gridView.trigger(action, e, data);
                }
            }

        });

        ActionsGridPlugin.PLUGIN_NAME = 'actions';

        PluginRegistry.register(ActionsGridPlugin);

        return ActionsGridPlugin;
    }
);
