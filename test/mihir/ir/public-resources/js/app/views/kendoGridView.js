
/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'kendo', 'collections/BaseCollection',
    'hb!templates/grid/grid-column-icon-header.html'],
    function($, _, Backbone, kendo, BaseCollection, iconHeaderTemplate) {
        'use strict';

        /**
         * DEPRECATED in favor of app/views/common/kendoGridView
         * Base class for a Backbone View that wraps a Kendo grid
         *
         */
        var KendoGridView = Backbone.View.extend({

            _validOptions: [
                'url',
                'model',
                'filters',
                'fields',
                'sort',
                'selectable',
                'groupable',
                'scrollable',
                'sortable',
                'editable',
                'pageable',
                'parseResponse',
                'filter',
                'serverSorting',
                'serverPaging'
            ],

            /**
             * Enhance the grid and datasource configs with options provided
             * at construction time
             *
             * @param options
             */
            initialize: function(options) {
                var self = this;
                options = options || {};

                _.defaults(_.extend(this, _.pick(options, this._validOptions)), {
                    url     : null,
                    model   : null,
                    filters : {},
                    fields  : {},
                    sort    : [],
                    selectable: 'row',
                    groupable: false,
                    scrollable: false,
                    sortable: true,
                    editable: false,
                    pageable: {
                        pageSizes: [ 10, 20, 30, 50, 100 ],
                        messages: {
                            display: "{0} - {1} "+$.t('grid.pagination.text.of')+" {2} "+$.t('grid.pagination.text.items'),
                            empty: $.t('grid.pagination.no.items'),
                            page: $.t('grid.pagination.no.page'),
                            of: $.t('grid.pagination.text.of')+" {0}", //{0} is total amount of pages
                            itemsPerPage: $.t('grid.pagination.items.per.page'),
                            first: $.t('grid.pagination.go.to.first.page'),
                            previous: $.t('grid.pagination.go.to.previous.page'),
                            next: $.t('grid.pagination.go.to.next.page'),
                            last: $.t('grid.pagination.go.to.last.page'),
                            refresh: $.t('grid.pagination.text.refresh')
                        }
                    },
                    serverSorting: true,
                    serverPaging: true
                });

                this._columns = options.columns || this._columns;
                this._selectedItems = options.selectedItems || new BaseCollection();
                this.schema = options.schema;

                this.dataSourceConfig = {
                    type: 'json',
                    transport: {
                        read: options.readFn || function(options) {
                            $.ajax(_.extend({
                                url: self.url + '?' + $.param(_.extend({},
                                    this.parameterMap(options.data),
                                    self.filters
                                )),
                                type: 'GET',
                                contentType: 'application/json',
                                success: options.success,
                                error: options.error
                            }, options.read));
                        },
                        parameterMap: function(options) {
                            var iroptions = {};
                            _.each(_.keys(options), function(key) {
                                switch (key) {
                                case 'take':
                                    iroptions['page.size'] = options.take;
                                    break;
                                case 'page':
                                    iroptions['page.page'] = options.page;
                                    break;
                                case 'sort':
                                    _.each(options.sort, function(sortObj) {
                                        iroptions['page.sort'] = sortObj.field;
                                        iroptions['page.sort.dir'] = sortObj.dir;
                                    });
                                    break;
                                }
                            });
                            return iroptions;
                        }
                    },
                    schema: _.extend({
                        data: 'content',
                        total: 'total',
                        model: {
                            id: 'id',
                            fields: this.fields
                        },
                        parse: this.parseResponse
                    }, this.schema || {}),
                    sort: this.sort,
                    serverSorting: this.serverSorting,
                    serverPaging: this.serverPaging,
                    pageSize: 20
                };
            },

            _grid: function() {
                return this.$el.data('kendoGrid');
            },

            /**
             * Get the data array from the grid object.
             */
            getData: function() {
                return this._grid().dataSource._data;
            },

            /**
             * Find the <tr> element that the given dom node lives in and
             * return the data object from the grid for that row.
             */
            getItemForDom: function(domNode) {
                if ($(domNode).is('tr')) {
                    return this._grid().dataItem($(domNode));
                }
                return this._grid().dataItem($(domNode).parents('tr:first'));
            },

            _gridConfig: function() {
                return {
                    groupable: this.groupable,
                    scrollable: this.scrollable,
                    selectable: this.selectable,
                    sortable: this.sortable,
                    editable: this.editable,
                    pageable: this.pageable,

                    columns: _.result(this, '_columns'),

                    change: _.bind(this.onGridSelectionChange, this),

                    dataBinding: _.bind(this._onGridDataBinding, this),

                    dataBound: _.bind(function() {
                        this.onGridDataBound();
                        this._doAfterGrid();
                    }, this),

                    save: _.bind(function(e) {
                        this._onGridEditSave(e.model, e.values, e.sender);
                    }, this),

                    edit: _.bind(this._onGridEditStart, this)
                };
            },

            /**
             * Create a kendo grid on the target element
             */
            render: function() {
                var dataSource = this._createDataSource();
                if (this._grid()) {
                    this._grid().setDataSource(dataSource);
                } else {
                    this.$el.kendoGrid($.extend({}, _.result(this, '_gridConfig'), {
                        dataSource: dataSource
                    }));
                }

                return this;
            },

            _createDataSource: function() {
                return kendo.data.DataSource.create(this.dataSourceConfig);
            },

            _getRowByItemId: function(id) {
                var kgrid = this._grid(),
                    dataRow = kgrid && kgrid.dataSource.get(id);
                return dataRow && this.$('tbody tr[data-uid=' + dataRow.uid + ']') || null;
            },

            markRowAsSelected: function(row) {
                $(row).addClass('k-state-selected active');
            },

            markRowAsUnselected: function(row) {
                $(row).removeClass('k-state-selected active');
            },

            findSelectedItemById: function(itemId) {
                return this._selectedItems.get(itemId);
            },

            isRowSelected: function(row) {
                var item = this.getItemForDom(row),
                    itemId = item.id || item[this.dataSourceConfig.schema.model.id];
                return this.findSelectedItemById(itemId);
            },

            getSelectedItems: function() {
                return this._selectedItems;
            },

            selectRows: function(rows) {
                var selectedItems = [];
                _.each(rows, function(row) {
                    var selectedItem = this.selectRow(row, {silent: true});

                    if (selectedItem) {
                        selectedItems.push(selectedItem);
                    }
                }, this);

                if (selectedItems.length) {
                    this.trigger('select', selectedItems.length === 1 ? selectedItems[0] : selectedItems);
                }
                else {
                    this.trigger('no-selection');
                }

            },

            /**
             * Select the given grid row.
             *
             * @param row
             * @param options
             */
            selectRow: function(row, options) {
                var item = this.getItemForDom(row),
                    selectedItem = null,
                    itemId;

                if (item) {
                    itemId = item.id || item[this.dataSourceConfig.schema.model.id];
                    selectedItem = this.findSelectedItemById(itemId);
                    if (!selectedItem) {
                        selectedItem = this._selectRow(itemId, row, options);
                    }
                }

                return selectedItem;
            },

            /**
             * Select a grid row given the item to be selected.
             */
            selectItem: function(itemId, options) {
                var row = this._getRowByItemId(itemId);
                if (row) {
                    this._selectRow(itemId, row, options);
                }
            },

            _selectRow: function(itemId, row, options) {
                var selectedItem = this._getItemModelById(itemId);
                if (!this.findSelectedItemById(itemId)) {
                    this._selectedItems.push(selectedItem);
                }
                this.markRowAsSelected(row);
                if (!_.result(options, 'silent')) {
                    this.trigger('select', selectedItem);
                }
                return selectedItem;
            },

            /**
             * Unselect the given grid row.
             *
             * @param row
             * @param options
             */
            unselectRow: function(row, options) {
                var item = this.getItemForDom(row),
                    unselectedItem = this.findSelectedItemById(item.id);

                if (unselectedItem) {
                    this._selectedItems.removeById(item.id);
                    this.markRowAsUnselected(row);
                    if (!_.result(options, 'silent')) {
                        this.trigger('unselect', unselectedItem);
                    }
                }

                return unselectedItem;
            },

            unselectItem: function(itemId, options) {
                var unselectedItem = this.findSelectedItemById(itemId),
                    row = this._getRowByItemId(itemId);

                if (unselectedItem) {
                    if (row) {
                        // row can be null if the unselect is issued for a non visible item.
                        this.markRowAsUnselected(row);
                    }
                    this._selectedItems.removeById(itemId);
                    if (!_.result(options, 'silent')) {
                        this.trigger('unselect', unselectedItem);
                    }
                }

                return unselectedItem;
            },

            getRowModel: function(row) {
                return this._getItemModelById(this.getItemForDom(row).id);
            },

            _getItemModelById: function(itemId) {
                var itemModel = this._grid().dataSource.get(itemId),
                    model = itemModel ? itemModel.toJSON() : {id: itemId};
                return this.model ? new this.model(model) : (itemModel || model);
            },

            /**
             * Capture the state of this grid view
             *
             * @returns {*}
             */
            getState: function() {
                var grid = this._grid();
                return grid && {
                    page: grid.dataSource.page(),
                    pageSize: grid.dataSource.pageSize(),
                    sort: grid.dataSource.sort()
                } || {};
            },

            /**
             * Restore the state of this grid view
             *
             * @param state
             */
            setState: function(state) {
                var grid = this._grid();
                if (grid) {
                    grid.dataSource.query(state);
                }
            },

            /**
             * Wrap the default grid selection change event.
             */
            onGridSelectionChange: function() {
                var grid = this._grid();

                this._clearAllSelectedItems();

                this.selectRows(grid ? grid.select() : []);

            },

            /**
             * Wrap the grid data bound event.
             */
            onGridDataBound: function() {
                var grid = this._grid();
                this._selectedItems.each(function(item) {
                    var itemId = item.get('id') || item.get(this.dataSourceConfig.schema.model.id);
                    this.selectItem(itemId, {silent: true});
                }, this);
                this.trigger('dataBound', grid);
            },

            _onGridEditSave: function(model, values, grid) {
                this.trigger('updateCell', model, values, grid);
            },

            _onGridEditStart: function(e) {
                this.trigger('editStart');
                e.container.find(':first-child').on('remove', _.bind(this._onGridEditCancel, this));
            },

            _onGridEditCancel: function() {
                this.trigger('editCancel');
            },

            /**
             * Add/clear a filtering parameter
             *
             * @param key
             * @param value
             */
            filter: function(key, value) {
                if (!value || value.trim() === '') {
                    delete this.filters[key];
                } else {
                    this.filters[key] = value.trim();
                }
                this.refresh();
            },
            
            /**
             * Add a filtering parameter.
             *
             * @param key
             * @param value
             */
            addFilter: function(key, value) {
                this.filters[key] = value.trim();
                this.refresh();
            },
            
            /**
             * Clear filtering parameter(s).
             *
             * @param key
             */
            clearFilter: function() {
                _.each(arguments, function(k) {
                    delete this.filters[k];
                }, this);
                this.refresh();
            },
            
            getFilters: function() {
                return this.filters;
            },

            /**
             * Refresh the grid by re-reading datasource.
             *
             */
            refresh: function() {
                var grid = this._grid();
                if (grid) {
                    grid.dataSource.page(1);
                }
            },

            clearSelection: function() {
                var grid = this._grid();
                if (grid) {
                    grid.clearSelection();
                }
            },

            /**
             * Refresh the grid. Unlike refresh(), do not reset the current page.
             */
            refreshRetainPage: function () {
                this._grid().dataSource.read();
            },

            /**
             * Clears all selected Rows from the table.
             */
            clearGridSelection: function(options) {
                var grid = this._grid();

                this._clearAllSelectedItems(options);

                if (grid && grid.selectable) {
                    grid.clearSelection();
                }
            },

            _clearAllSelectedItems: function(options) {
                var toUnselect = this._selectedItems.map(function(item) {
                    return item;
                });

                _.each(toUnselect, function(item) {
                    var itemId = item.get('id') || item.get(this.dataSourceConfig.schema.model.id);
                    this.unselectItem(itemId, {silent: true});
                }, this);

                if (!_.result(options, 'silent')) {
                    this.trigger('unselect', toUnselect);
                }

                this._selectedItems.reset();

            },

            indicateLoading: function(loading) {
                loading = loading || _.isUndefined(loading);
                kendo.ui.progress(this.$("div.k-grid-content"), loading);
            },

            /**
             * Parser for the data response.
             */
            parseResponse: function(response) {
                return response;
            },

            destroy: function() {
                var grid = this._grid();
                if (grid) {
                    grid.destroy();
                }
                this.$el.empty();
            },

            /**
             * Data binding event callback, should fire just before new data bound.
             * Useful to destroy previous elements added to grid cells.
             *
             * @private
             */
            _onGridDataBinding: function() {
                this.$('.has-popover').popover('destroy');
                this.$('[data-toggle=tooltip]').tooltip('destroy');
            },

            _doAfterGrid: function() {
                this.$('.has-popover').popover({
                    trigger: 'hover'
                });

                this.$('[data-toggle=tooltip]').tooltip();

                this.$('td:has(.dropdown)').addClass('dropdown-col');

                this.trigger('afterGrid');
            },

            getIconHeader: function(options) {
                return iconHeaderTemplate(options);
            }

        });

        return KendoGridView;
    }
);
