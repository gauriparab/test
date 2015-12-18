/*global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'kendo',
    'views/common/pluginRegistry'
], function(
    $,
    _,
    Backbone,
    kendo,
    PluginRegistry) {

    'use strict';

    /**
     * Custom data transport for kendo grid
     *
     * @type {*}
     */
    var Transport = kendo.Class.extend({

        _grid: null,

        /**
         * Constructor
         * @param options
         */
        init: function(grid) {
            this._grid = grid;
        },

        /**
         * Method for fetching data
         *
         * @param options
         */
        read: function(options) {
            $.ajax({
                url: this._grid._url + '?' + $.param(_.extend({},
                    this._parameterMap(options.data),
                    this._grid._filters
                )),
                type: 'GET',
                contentType: 'application/json',
                success: options.success,
                error: options.error
            });
        },

        /**
         * Convert kendo grid parameters to spring parameters
         *
         * @param options
         * @returns {Object|*|Mixed}
         * @private
         */
        _parameterMap: function(options) {
            return _.reduce(options, function(memo, v, k) {
                switch (k) {
                case 'take':
                    memo['page.size'] = v;
                    break;
                case 'page':
                    memo['page.page'] = v;
                    break;
                case 'sort':
                    _.each(v, function(sortObj) {
                        memo['page.sort'] = sortObj.field;
                        memo['page.sort.dir'] = sortObj.dir;
                    });
                    break;
                }
                return memo;
            }, {});
        }

    });

    var ColumnBuilder = kendo.Class.extend({
        init: function(grid) {
            this._grid = grid;
            this._col = {
                sortable: true,
                hidden: false
            };
        },

        build: function() {
            return this._col;
        }
    });

    _.each(['field', 'title', 'sortable', 'template', 'headerTemplate', 'width', 'hidden', 'attributes', 'command', 'headerAttributes'], function(property) {
        ColumnBuilder.prototype[property] = function(value) {
            this._col[property] = value;
            return this;
        };
    });

    ColumnBuilder.new = function(grid) {
        return new ColumnBuilder(grid);
    };

    // Event names
    var Event = {
        EDIT_START: 'editStart',
        EDIT_SAVE: 'editSave',
        EDIT_CLOSE: 'editClose',
        DATA_BINDING: 'dataBinding',
        DATA_BOUND: 'dataBound',
        COLS_CHANGED: 'colsChanged'
    };

    /**
     * A Backbone.View that wraps a kendo grid widget
     *
     * @type {*}
     */
    var KendoGridView = Backbone.View.extend({

        // Endpoint to fetch data
        _url: null,

        // Class of Backbone.Model to wrap rows
        _model: null,

        // Filtering parameters
        _filters: {},

        // Schema field types
        _fields: {},

        // model ID field
        _id: 'id',

        // Initial sorting
        _sort: [],

        // Rows may be grouped
        _groupable: false,

        // Grid may be scrolled
        _scrollable: false,

        // Columns may be sorted
        _sortable: {allowUnsort: false},

        // Cells may be edited
        _editable: false,

        // Paging capability
        _pageable: {
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

        // Default page size
        _pageSize: 20,

        // Sorting occurs on server?
        _serverSorting: true,

        // Paging occurs on server?
        _serverPaging: true,

        // type of Transport
        _transportCls: Transport,

        _total: 'total',

        /**
         * Constructor
         *
         * @param options
         */
        initialize: function(options) {
            _.each(options || {}, function(v, k) {
                if (KendoGridView.prototype.hasOwnProperty('_'+k)) {
                    this['_'+k] = v;
                }
            }, this);
            this._loadedPlugins = {};

            this._transport = new this._transportCls(this);

            this._cols = this._columns();
        },

        /**
         * Load required plugins
         * @private
         */
        loadPlugin: function(name, options) {
            this._loadedPlugins[name] = new (PluginRegistry.get(name))(this, options);
        },

        /**
         * Delegate Events
         * call plugin method
         *
         */
        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);

            this.listenTo(this, Event.COLS_CHANGED, this._onGridColumnsChanged);

            _.each(this._loadedPlugins, function(plugin) {
                plugin.delegateEvents();
            });
        },

        /**
         * Undelegate Events
         * call plugin method
         *
         */
        undelegateEvents: function() {
            _.each(this._loadedPlugins, function(plugin) {
                plugin.undelegateEvents();
            });

            this.stopListening(this, Event.COLS_CHANGED);

            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        /**
         * Create a kendo grid on the target element
         *
         */
        render: function() {
            var ds = kendo.data.DataSource.create(this._dataSourceConfig()),
                grid = this.$el.data('kendoGrid');

            if (grid) {
                grid.setDataSource(ds);
            } else {
                var columns = _.reduce(this._loadedPlugins, function(columns, plugin) {
                    return plugin.postProcessColumns(columns);
                }, this._cols);

                this.$el.kendoGrid($.extend(this._gridConfig(), {
                    dataSource: ds,
                    columns: columns
                }));
            }
            this.$el.find('table').css('border-collapse', 'collapse');
		    this.$el.find('tbody').addClass('k-grid-body')
		    
            return this;
        },

        /**
         * Add a filtering parameter.
         *
         * @param key
         * @param value
         */
        addFilter: function(key, value) {
            this._filters[key] = value.trim();
            this.refresh();
        },

        /**
         * Add filtering parameters where filters is a map of keys and values.
         *
         * @param filters
         */
        addFilters: function(filters) {
            _.each(filters, function(value, key){
                this._filters[key] = value.trim();
            }, this);
            this.refresh();
        },

        /**
         * Clear filtering parameter(s).
         *
         * @param key
         */
        clearFilter: function() {
            _.each(arguments, function(k) {
                delete this._filters[k];
            }, this);
            this.refresh();
        },
        
        getFilters: function() {
            return this._filters;
        },

        /**
         * Retrieve a new ColumnBuilder for this grid
         *
         * @returns {*}
         * @private
         */
        cb: function() {
            return ColumnBuilder.new(this);
        },

        /**
         * Refresh the grid.
         *
         */
        refresh: function () {
            this._withGrid(function(grid) {
                grid.dataSource.read();
            });

            _.each(this._loadedPlugins, function(plugin) {
                plugin.onGridRefresh();
            });
        },

        destroy: function() {
            this._withGrid(function(grid) {
                grid.destroy();
            });
            this.$el.empty();

            _.each(this._loadedPlugins, function(plugin) {
                plugin.onGridDestroy();
            });
        },

        indicateLoading: function(loading) {
            loading = loading || _.isUndefined(loading);
            kendo.ui.progress(this.$("div.k-grid-content"), loading);
        },

        /**
         * Configuration of kendo datasource
         * Override this if you want to customize total config
         *
         * @returns {*}
         * @private
         */
        _dataSourceConfig: function() {
            return {
                type: 'json',

                transport: this._transport,

                schema: {
                    data: 'content',
                    total: this._total,
                    model: {
                        id: this._id,
                        fields: this._fields
                    },
                    parse: _.bind(this._parseResponse, this)
                },

                sort: this._sort,

                serverSorting: this._serverSorting,

                serverPaging: this._serverPaging,

                pageSize: this._pageSize
            };
        },

        /**
         * Configuration of kendo grid
         * Override this if you want to customize total config
         *
         * @returns {*}
         * @private
         */
        _gridConfig: function() {
            var config = {
                groupable: this._groupable,

                scrollable: this._scrollable,

                sortable: this._sortable,

                editable: this._editable,

                pageable: this._pageable,

                dataBinding: _.bind(this._onGridDataBinding, this),

                dataBound: _.bind(this._onGridDataBound, this),

                save: _.bind(function(e) {
                    this._onGridEditSave(e.model, e.values, e.sender);
                }, this),

                edit: _.bind(this._onGridEditStart, this)
            };

            return config;
        },

        /**
         * How to parse data response from server, override to customize
         *
         * @param response
         * @returns {*}
         * @private
         */
        _parseResponse: function(response) {
            return response;
        },

        /**
         * Construct intial set of grid columns
         *
         * @returns {*}
         * @private
         */
        _columns: function() {
            // empty
        },

        /**
         * Grid data binding handler
         * @private
         */
        _onGridDataBinding: function() {
            this.trigger(Event.DATA_BINDING);

            _.each(this._loadedPlugins, function(plugin) {
                plugin.onGridDataBinding();
            });
        },

        /**
         * Grid data bound handler
         * @private
         */
        _onGridDataBound: function() {
            this.trigger(Event.DATA_BOUND);
		
            _.each(this.$el.find("div.dropdown"), function(div) {
                $(div).parent().css("overflow", "visible");
            });

		    $("[data-toggle='tooltip']").tooltip();   
		    
		    if(this.$(".k-grid-body").height() >= 500){
		    	this.$(".k-grid-header").css("padding-right", "16px");
		    }else{
		    	this.$(".k-grid-header").css("padding-right", "0px");
		    }

            _.each(this._loadedPlugins, function(plugin) {
                plugin.onGridDataBound();
            });
        },

        /**
         * Grid editing complete handler
         * @private
         */
        _onGridEditSave: function() {
            this.trigger(Event.EDIT_SAVE);
        },

        /**
         * Grid editing started handler
         * @private
         */
        _onGridEditStart: function(e) {
            this.trigger(Event.EDIT_START);
            e.container.find(':first-child').on('remove', _.bind(this._onGridEditClose, this));
        },

        /**
         * Grid editing cancelled handler
         * @private
         */
        _onGridEditClose: function() {
            this.trigger(Event.EDIT_CLOSE);
        },

        /**
         * Grid columns changed handler
         * @private
         */
        _onGridColumnsChanged: function() {
            this.destroy();
            this.render();
        },

        /**
         * If underlying grid exists (has been rendered), pass the
         * grid object to the supplied function.
         *
         * @param fn
         * @returns {*}
         * @private
         */
        _withGrid: function(fn) {
            var grid = this.$el.data('kendoGrid');
            if (grid) {
                var args = Array.prototype.slice.call(arguments, 1);
                return fn.apply(this, [grid].concat(args));
            } else {
                return undefined;
            }
        },

        _toModel: function(el) {
            return new this._model(this._toItem(el).toJSON());
        },

        _at: function(index) {
            return this._toItem(this.$('tbody tr:eq('+index+')'));
        },

        _byId: function(id) {
            return this._withGrid(function(grid) {
                var dataRow = grid.dataSource.get(id);
                return dataRow && this._toItem(this.$('tbody tr[data-uid=' + dataRow.uid + ']'));
            });
        },

        _toItem: function(el) {
            var $el = $(el);
            $el = $el.is('tr') ? $el : $el.parents('tr:first');
            return this._withGrid(function(grid) {
                return grid.dataItem($el);
            });
        }

    });

    var UNDERSCORE_METHODS = ['each','every','filter','map','reject','some','where'];

    _.each(UNDERSCORE_METHODS, function(method) {
        KendoGridView.prototype[method] = function() {
            var args = [].slice.call(arguments);
            return this._withGrid(function(grid) {
                args.unshift(grid.dataSource._data);
                return _[method].apply(_, args);
            });
        };
    });

    var KENDO_METHODS = ['showColumn', 'hideColumn'];

    _.each(KENDO_METHODS, function(method) {
        KendoGridView.prototype[method] = function() {
            var args = [].slice.call(arguments);
            return this._withGrid(function(grid) {
                return grid[method].apply(grid, args);
            });
        };
    });

    KendoGridView.Transport = Transport;
    KendoGridView.Event = Event;

    return KendoGridView;
});
