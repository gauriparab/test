/*global define:false*/
define(['jquery', 'underscore', 'views/common/grid/plugins/baseGridPlugin', 'views/common/pluginRegistry'],
    function($, _, BaseGridPlugin, PluginRegistry) {
        'use strict';

        /**
         * Grid plugin that wires up a bootstrap popover for any element that matches the selectors.
         *
         * @type {*|void|Object}
         */
        var PopoversGridPlugin = BaseGridPlugin.extend({

            _selector: '[data-toggle=popover]',

            init: function(gridView, options) {
                BaseGridPlugin.prototype.init.call(this, gridView);
                this._popoverOptions = options || {};
            },

            delegateEvents: function() {
                var onShowPopover = _.bind(this._onShowPopover, this);

                this._gridView.$el.on(this._event('show'), this._selector, onShowPopover);
                $(document).on(this._event('click'), ':not(.popover)', onShowPopover);
            },

            undelegateEvents: function() {
                this._gridView.$el.off(this._event());
                this._gridView.$('.k-grid-content').off(this._event());
                $(document).off(this._event());
            },

            onGridDataBinding: function() {
                this._gridView.$(this._selector).popover('destroy');
            },

            onGridDataBound: function() {
                this._gridView.$(this._selector).popover(this._popoverOptions);
                this._gridView.$('.k-grid-content').on(this._event('scroll'), _.bind(this._hideAllPopovers, this));
            },

            _onShowPopover: function(e) {
                if ($(e.currentTarget).is(this._selector)) {
                    e.stopPropagation();
                }
                this._hideAllPopovers(e);
            },

            _hideAllPopovers: function(e) {
                this._gridView.$(this._selector).not(e.currentTarget).popover('hide');
            },

            _event: function(name) {
                return (name || '') + '.' + PopoversGridPlugin.PLUGIN_NAME;
            }

        });

        PopoversGridPlugin.PLUGIN_NAME = 'popovers';

        PluginRegistry.register(PopoversGridPlugin);

        return PopoversGridPlugin;
    }
);
