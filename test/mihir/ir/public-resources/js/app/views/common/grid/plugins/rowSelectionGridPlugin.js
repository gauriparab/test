/*global define:false*/
define(['jquery', 'underscore', 'views/common/grid/plugins/baseGridPlugin', 'views/common/pluginRegistry'],
    function($, _, BaseGridPlugin, PluginRegistry) {
        'use strict';

        var ACTIVE_CLS = 'active',
            ROW_SELECT = 'rowSelect';

        /**
         * Grid plugin that enables single row selectability
         *
         * @type {*|void|Object}
         */
        var RowSelectionGridPlugin = BaseGridPlugin.extend({

            init: function() {
                BaseGridPlugin.prototype.init.apply(this, arguments);
                this._gridView.selectRow = _.bind(this._selectRow, this);
                this._gridView.clearRow = _.bind(this._clearRow, this);
            },

            delegateEvents: function() {
                this._gridView.$el.on('click.'+RowSelectionGridPlugin.PLUGIN_NAME, 'tbody tr', _.bind(this._onRowClicked, this));
                this._gridView.$el.on('click.'+RowSelectionGridPlugin.PLUGIN_NAME, 'tbody tr td:first-child :checkbox', _.bind(this._onCheckboxClicked, this));
            },

            undelegateEvents: function() {
                this._gridView.$el.off('.'+RowSelectionGridPlugin.PLUGIN_NAME);
            },

            /**
             * Use pointer cursor while hovering over rows.
             *
             */
            onGridDataBound: function() {
                this._gridView.$('tbody tr').css({cursor: 'pointer'});
            },

            
            _onRowClicked: function(e) {
                e.preventDefault();
                var tr = $(e.currentTarget); 
                var active = tr.hasClass(ACTIVE_CLS);
                this._updateRowSelection(tr, active);
            },
            
            _onCheckboxClicked: function(e) {
                var checkbox = $(e.currentTarget);
                var tr = $(checkbox).closest('tr');
                var active = $(checkbox).checked;
                this._updateRowSelection(tr, active);
            },
            
            /**
             * Update active highlight and trigger selection event.
             *
             * @param e
             * @private
             */
            _updateRowSelection: function(tr, isActive) {
                if (isActive) {
                    tr.removeClass(ACTIVE_CLS);
                    this._gridView.trigger(ROW_SELECT);
                } else {
                    this._gridView.$('tbody tr').removeClass(ACTIVE_CLS);
                    tr.addClass(ACTIVE_CLS);
                    this._gridView.trigger(ROW_SELECT, this._gridView._toModel(tr));
                }
            },

            _selectRow: function(id) {
                var self = this;
                this._gridView._withGrid(function(grid) {
                    var item = grid.dataSource.get(id);
                    var rowid = item ? item.uid : id;
                    
                    var tr = this.$('tbody tr[data-uid=' + rowid + ']');
                    if (tr.length) {
                        self._onRowClicked($.Event('click', { currentTarget: tr }));
                    }
                });
            },

            _clearRow: function() {
                this._gridView.trigger(ROW_SELECT);
            }

        });

        RowSelectionGridPlugin.PLUGIN_NAME = 'rowSelection';

        PluginRegistry.register(RowSelectionGridPlugin);

        return RowSelectionGridPlugin;
    }
);
