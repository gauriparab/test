/*global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'views/common/grid/kendoGridView',
    'views/common/grid/singleValueGridView',
    'views/common/searchView',
    'views/filterChains/filterView',
    'hb!templates/filterChain/filter-edit-type-dynamicmultiselect.html'
].concat(
    'views/common/grid/plugins/multiSelectionGridPlugin'
), function(
    $,
    _,
    Backbone,
    KendoGridView,
    SingleValueGridView,
    SearchView,
    FilterView,
    template
) {

    "use strict";
    
    var Transport = KendoGridView.Transport.extend({
        
        read: function(options) {
            $.ajax({
                url: this._grid._url + '?' + $.param(_.extend({},
                    this._parameterMap(options.data),
                    this._grid._filters
                )),
                type: 'GET',
                async: false,
                contentType: 'application/json',
                success: options.success,
                error: options.error
            });
        },
    });
    
    /**
     * View for editing Dynamic Multiple Select Filters.
     * This filter type contains large amount of values and so this view
     * uses a server side paging table to display the options.
     */
    var FilterEditTypeDynamicMultipleSelectView = Backbone.View.extend({

        selectable: false,
        
        events: {
            'change select#filter-select-filter-option': 'changeFilterOption'
        },

        // store a local model of configured values because the table model
        // is refreshed everytime a page is turned or search is made.
        // the configured values are not stored until the filter is added to the
        // chain and the chain is saved
        _configuredValues: null,
        
        initialize: function(options) {
            this.filter = options.filter;
            this._configuredValues = this._initConfiguredValues(this.filter);

            // initialize the search box
            this.searchView = new SearchView();

            // initialize the grid
            this.grid = new SingleValueGridView({
                transportCls: Transport,
                url: '/ir/secure/api/filterChain/dynamic',
                scrollable: true,
                filters: {
                    searchText: '',
                    filterId:this.filter.get('id')
                }
            });
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);

            // wire search up to the grid
            this.listenTo(this.searchView, 'search', this._onSearch);
            this.listenTo(this.grid, KendoGridView.Event.MULTI_SELECT, this._onGridSelection);
        },

        undelegateEvents: function() {
            this.stopListening(this.grid);
            this.stopListening(this.searchView);

            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {

            // render filter option selection
            this.$el.html(template({
                filter : this.filter,
                filterOptions : ['CONFIGURED', 'INCLUDE', 'EXCLUDE']
            }));

            // select the configured option in the dropdown
            var configuredfilterOption = this.filter.get('configuredFilterOption');
            this.$el.find('select#filter-select-filter-option').val(configuredfilterOption);

            this.searchView.setElement('#filter-select-search').render();
            this.grid.setElement('#filter-select-configured-grid').render();

            this.grid.select.apply(this.grid, this._configuredValues);
        },
        
        // determine what to use for the configured values model when the view is first created
        _initConfiguredValues: function(filter) {
            // if the filter is already configured, use those values
            var configured = filter.get('configuredValues');
            if (!configured || !configured.length) {
                // otherwise use the default
                configured = filter.get('defaultValues');
            }
            return configured || [];
        },

        _onGridSelection: function(models) {
            this._configuredValues = models.pluck('value');
            this.trigger('filterValueSelectionChanged');
        },

        changeFilterOption: function(e) {
            e.preventDefault();
            var value = $(e.currentTarget).val();
            this.filter.set('configuredFilterOption', value);
            if (value === 'CONFIGURED') {
                this.grid.showColumn(0);
            } else {
                this.grid.hideColumn(0);
            }

        },

        // called from FilterView 
        prepareFilterForAdd: function() {
            this.filter.set('configuredValues', this._configuredValues);
            this.filter.set("configuredIncludeMissing", this.$('#dynamicmultiselectfilter-includeUnannotated').prop('checked'));
        },
        
        // called from FilterView 
        isValidFilter: function() {
            // only configured filter needs to be validated...
            if (this.$('#filter-select-filter-option').val() !== 'CONFIGURED') {
                return true;
            }

            // validate configured filter...
            var selected = this._configuredValues;
            return selected && selected.length;
        },

        _onSearch: function(q) {
            this.grid.addFilter('searchText', q);
        }
    });

    return FilterEditTypeDynamicMultipleSelectView;
});