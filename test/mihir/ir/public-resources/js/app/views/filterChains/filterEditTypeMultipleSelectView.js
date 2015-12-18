/*global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'views/common/grid/kendoGridView',
    'views/common/grid/singleValueGridView',
    'views/filterChains/filterView',
    'hb!templates/filterChain/filter-edit-type-multiselect.html'
], function(
    $,
    _,
    Backbone,
    KendoGridView,
    SingleValueGridView,
    FilterView,
    template
) {

    'use strict';

    var Transport = KendoGridView.Transport.extend({
        read: function(options) {
            var self = this;
            options.success({
                content: self._grid._filter.get('canonical')
            });
        }
    });

    var FilterEditTypeMultipleSelectView = Backbone.View.extend({

        events: {
            'change select#filter-select-filter-option': '_onChangeFilterOption'
        },

        initialize: function(options) {
            this.filter = options.filter;

            this.grid = new SingleValueGridView({
                transportCls: Transport,
                serverPaging: false,
                serverSorting: false
            });

            this.grid._filter = this.filter;
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);

            this.listenTo(this.grid, KendoGridView.Event.MULTI_SELECT, this._onGridSelection);
        },

        undelegateEvents: function() {
            this.stopListening(this.grid);

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

            // render the grid if the option is configured
            this.grid.setElement('#filter-select-configured-grid').render();

            this.grid.select.apply(this.grid, this._getConfiguredValues());

            return this;
        },

        prepareFilterForAdd: function() {
            this.filter.set('configuredValues', this.grid.getSelected().pluck('value'));
            this.filter.set('configuredIncludeMissing', this.$('#multiselectfilter-includeUnannotated').prop('checked'));
        },

        isValidFilter: function() {
            // only configured filter needs to be validated...
            if (this.$('#filter-select-filter-option').val() !== 'CONFIGURED') {
                return true;
            }
            // validate configured filter...
            var selected = this.grid.getSelected().pluck('value');
            return selected && selected.length;
        },

        _onGridSelection: function() {
            this.trigger('filterValueSelectionChanged');
        },

        _onChangeFilterOption: function(e) {
            e.preventDefault();
            var value = $(e.currentTarget).val();
            this.filter.set('configuredFilterOption', value);
            if (value === 'CONFIGURED') {
                this.grid.showColumn(0);
            } else {
                this.grid.hideColumn(0);
            }
        },

        _getConfiguredValues: function() {
            var configured = this.filter.get('configuredValues');
            if (!configured || !configured.length) {
                configured = this.filter.get('defaultValues');
            }
            return configured;
        }

    });

    return FilterEditTypeMultipleSelectView;
});