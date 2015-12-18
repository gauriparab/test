/*global define:false*/
define(['jquery', 'underscore', 'views/templateView', 'views/analysis/analysisLaunchSampleGridView', 'views/common/searchView', 
    'views/common/filterView', 'models/analysis/specimenGroupModel', 'hb!templates/analysis/analysis-launch-samples.html'],
    function($, _, TemplateView, SampleGridView, SearchView, FilterView, SpecimenGroup, template) {
        'use strict';

        var SamplesView = TemplateView.extend({

            template: template,

            _gridCls: SampleGridView,

            initialize: function(options) {
                var self = this;

                // A SampleGridView with a custom transport
                this.gridView = new this._gridCls({
                    readFn: function(options) {
                        $.ajax({
                            url: '/ir/secure/api/v40/analysis/allowed/samples?' + $.param($.extend({},
                                this.parameterMap(options.data),
                                self.gridView.filters
                            )),
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(self.model.toSlimJSON()),
                            success: options.success,
                            error: options.error
                        });
                    }
                });

                this.searchView = new SearchView();

                this.filterView = new FilterView({
                    filters: [
                        /* 'Flagged', */
                        'Unanalyzed'
                    ],
                    title: $.t('filter.samples')
                });

                this.sidebarView = options.sidebar;

                this.searchView.on('search', this.onSearch, this);

                this.filterView.on('filter', this.onFilter, this);

                this.model.on('change:workflow', this._workflowChanged, this);
                
                if (this._initialize) {
                    this._initialize(options);
                }
            },

            render: function() {
                TemplateView.prototype.render.apply(this, arguments);
                this.searchView.setElement(this.$('#query-form')).render();
                this.filterView.setElement(this.$('#flag-filters')).render();
                this.gridView.setElement(this.$('#samples-grid')).render();
            },

            getState: function() {
                return this.gridView.getState();
            },

            setState: function(state) {
                this.gridView.setState(state);
            },

            onSearch: function(query) {
                this.gridView.filter('q', query);
            },

            onFilter: function(filter) {
                this.gridView.filter('flag', filter);
            },

            _workflowChanged: function() {
                this.model.unset('specimenGroup');
                this.model.get("specimenGroups").reset();
            }

        });

        return SamplesView;

    }
);