/*global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'views/common/grid/kendoGridView',
    'views/common/grid/plugins/baseGridPlugin',
    'views/common/pluginRegistry',
    'hb!templates/grid/grid-column-check.html'
], function(
    $,
    _,
    Backbone,
    KendoGridView,
    BaseGridPlugin,
    PluginRegistry,
    checkboxColumnTemplate) {

    'use strict';

    var SELECTED_CLS = 'k-state-selected',
        MULTI_SELECT = 'multiSelect';

    /**
     * Grid plugin that injects an extra first column that contains a checkbox per row (and one for the header).
     * It also wires up all events for the checkboxes.
     *
     * @type {*|void|Object}
     */
    var MultiSelectionGridPlugin = BaseGridPlugin.extend({

        /**
         * Constructor
         * Take over the KendoGridView _columns() call
         *
         * @param gridView
         */
        init: function(gridView, options) {
            BaseGridPlugin.prototype.init.call(this, gridView);

            this._gridView.select = _.bind(this._select, this);
            this._gridView.unselect = _.bind(this._unselect, this);
            this._gridView.clearSelection = _.bind(this._clearSelection, this);
            this._gridView.getSelected = _.bind(this._getSelected, this);
            this._gridView.eachSelected = _.bind(this._eachSelected, this);

            this._selectedModels = new Backbone.Collection();
            this._lastIndexSelected = 0;

            options = options || {};
            this._columnWidth = options.columnWidth;
            this._tooltipMsg = options.tooltipMsg;
        },

        delegateEvents: function() {
            this._gridView.$el.on('click.'+MultiSelectionGridPlugin.PLUGIN_NAME, 'tbody tr td:first-child :checkbox', _.bind(this._onCheckboxClicked, this));
            this._gridView.$el.on('click.'+MultiSelectionGridPlugin.PLUGIN_NAME, 'thead tr th:first-child :checkbox', _.bind(this._onAllClicked, this));
            this._gridView.$el.on('click.'+MultiSelectionGridPlugin.PLUGIN_NAME, 'tbody tr', _.bind(this._onRowClicked, this));
        },

        undelegateEvents: function() {
            this._gridView.$el.off('.'+MultiSelectionGridPlugin.PLUGIN_NAME);
        },

        /**
         * When grid is refreshed (or initialized), update selection state based on current selections.
         *
         */
        onGridDataBound: function() {
            this._updateSelectionState();
        },

        /**
         * Splice new checkbox column
         *
         * @returns {Array}
         * @private
         */
        postProcessColumns: function(cols) {
            var checkboxColumn = this._gridView.cb()
                .headerTemplate(checkboxColumnTemplate({header: true, tooltipMsg: this._tooltipMsg}))
                .template(checkboxColumnTemplate);

            if (this._columnWidth) {
                checkboxColumn.width(this._columnWidth);
            }

            return [ checkboxColumn.build() ].concat(cols);
        },

        /**
         * Just be sure to update last selected row when any row is clicked.
         *
         * @param e
         * @private
         */
        _onRowClicked: function(e) {
            e.preventDefault();
            this._updatedSelectedIndex(e.currentTarget);
        },

        /**
         * After checkbox clicked, update _selectedModels state, with special handling for SHIFT key.
         *
         * @param e
         * @private
         */
        _onCheckboxClicked: function(e) {
            e.stopPropagation();

            var cb = $(e.currentTarget),
                $tr = cb.parents('tr');

            if (cb.is(':checked')) {
                this._addRows($tr);

                // SHIFT key induces group selection
                if (e.shiftKey) {
                    var clickedIndex = $tr.index(),
                        start = Math.min(this._lastIndexSelected, clickedIndex),
                        delta = Math.max(this._lastIndexSelected, clickedIndex) - start,
                        selectors = [];
                    for (var i = 0; i <= delta; i++) {
                        selectors.push('tbody tr:eq('+(start+i)+')');
                    }
                    this._addRows(this._gridView.$(selectors.join(',')));
                }
            } else {
                this._removeRows($tr);
            }

            this._updatedSelectedIndex($tr);
            this._updateSelectionState();
            this._gridView.trigger(MULTI_SELECT, this._selectedModels);
        },

        /**
         * Select/unselect all visible rows.
         *
         * @param e
         * @private
         */
        _onAllClicked: function(e) {
            e.stopPropagation();

            var cb = $(e.currentTarget);

            if (cb.is(':checked')) {
                // add any rows with unselected checkboxes to the selected collection
            	this._addRows(this._gridView.$('tbody tr:has(:checkbox:not(:disabled):not(:checked))'));
            } else {
                // remove all rows on page from the selected collection
                this._removeRows(this._gridView.$('tbody tr'));
            }

            this._lastIndexSelected = 0;
            this._updateSelectionState();
            this._gridView.trigger(MULTI_SELECT, this._selectedModels);
        },

        /**
         * Add specified rows to selected collection.
         *
         * @param $rows
         * @private
         */
        _addRows: function($rows) {
            _.each($rows, function(row) {
                this._selectedModels.add(this._gridView._toModel($(row)));
            }, this);
        },

        /**
         * Remove specified rows from selected collection.
         *
         * @param $rows
         * @private
         */
        _removeRows: function($rows) {
            _.each($rows, function(row) {
                this._selectedModels.remove($(row).find(':checkbox').data('id'));
            }, this);
        },

        /**
         * Update visible selection state based on the current selected collection.
         *
         * @private
         */
        _updateSelectionState: function() {
            var self = this;
            this._gridView._withGrid(function(grid) {
                this.$('tbody tr')
                    .removeClass(SELECTED_CLS)
                    .find('td:first-child :checkbox')
                    .prop('checked', false);

                self._selectedModels.each(function(model) {
                    var row = grid.dataSource.get(model.id);
                    if (row) {
                        this.$('tr[data-uid='+row.uid+']')
                            .addClass(SELECTED_CLS)
                            .find('td:first-child :checkbox')
                            .prop('checked', true);
                    }
                }, this);

                this.$('thead tr th:first-child :checkbox')
                    .prop('checked', !this.$('tbody tr:has(:checkbox:not(:disabled):not(:checked))').length);

		if(!grid.dataSource.data().length){
		    this.$('thead tr th:first-child :checkbox').removeAttr('checked');
		}
            });
        },

        /**
         * Remember last selected index.
         *
         * @param el
         * @private
         */
        _updatedSelectedIndex: function(el) {
            this._lastIndexSelected = $(el).index();
        },

        /**
         * Add rows to selection by ids.
         *
         * @private
         */
        _select: function() {
            var ids = Array.prototype.slice.call(arguments),
                selectors = this._getRowSelectors(ids);
            if (!_.isEmpty(selectors)) {
                this._addRows(this._gridView.$(selectors.join(',')));
                this._updateSelectionState();
                this._gridView.trigger(MULTI_SELECT, this._selectedModels);
            }
        },

        _unselect: function() {
            var ids = Array.prototype.slice.call(arguments),
                selectors = this._getRowSelectors(ids);
            if (!_.isEmpty(selectors)) {
                this._removeRows(this._gridView.$(selectors.join(',')));
                this._updateSelectionState();
                this._gridView.trigger(MULTI_SELECT, this._selectedModels);
            }
        },

        _clearSelection: function() {
            this._selectedModels = new Backbone.Collection();
            this._updateSelectionState();
            this._gridView.trigger(MULTI_SELECT, this._selectedModels);
        },

        _getSelected: function() {
            return this._selectedModels;
        },

        _eachSelected: function(predicate) {
            this._selectedModels.each(function(model) {
                var item = this._gridView._byId(model.id);
                if (item) {
                    predicate.call(this, item);
                }
            }, this);
        },

        _getRowSelectors: function(ids) {
            return this._gridView._withGrid(function(grid) {
                var selectors = [];
                _.each(ids, function(id) {
                    var item = grid.dataSource.get(id);
                    if (item) {
                        selectors.push('tbody tr[data-uid=' + item.uid + ']');
                    }
                });
                return selectors;
            });
        },
        
        onGridRefresh: function() {
        	this._eachSelected(this.merge);
        	
        },
        
        merge: function(item) {
        	this._selectedModels.set(new this._gridView._model(item.toJSON()), {remove: false});
        }
        

    });

    MultiSelectionGridPlugin.PLUGIN_NAME = 'multiSelection';
    KendoGridView.Event.MULTI_SELECT = MULTI_SELECT;

    PluginRegistry.register(MultiSelectionGridPlugin);

    return MultiSelectionGridPlugin;
});
