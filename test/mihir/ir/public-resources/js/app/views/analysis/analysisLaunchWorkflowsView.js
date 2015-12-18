/*global define:false*/
define(['jquery',
        'underscore',
        'views/templateView',
        'views/workflows/workflowGridView',
        'views/common/searchView',
        'views/common/filterView',
        'hb!templates/analysis/analysis-launch-workflows.html',
        'hb!templates/common/versionFilter.html'
    ].concat('views/common/grid/plugins/statefulGridPlugin'),
    function($,
            _,
            TemplateView,
            WorkflowGridView,
            SearchView,
            FilterView,
            template,
            versionFilterTemplate) {
        'use strict';

        /**
         * View of available workflows during analysis launch
         *
         * @type {*}
         */
        var WorkflowsView = TemplateView.extend({

            template: template,

            initialize: function(options) {

                this.gridView = new WorkflowGridView({
                    url: '/ir/secure/api/v40/analysis/workflows',
                    nameHasAction: false
                });
                this.gridView.loadPlugin('stateful');

                this.searchView = new SearchView();

                this.typeFilterView = new FilterView({
                    url: '/ir/secure/api/v40/workflows/types',
                    msgKeyPrefix: 'WorkflowApplicationType.',
                    hasIcons: true,
                    excludes: [
                        'TYPING'
                    ],
                    title: $.t('filter.application')
                });

                this.flagFilterView = new FilterView({
                    filters: [
                        'Ion',
                        'Custom'
                    ],
                    title: $.t('filter.workflow')
                });

                this.techniqueFilterView = new FilterView({
                    url: '/ir/secure/api/v40/workflows/techniques',
                    title: $.t('filter.technology')
                });

                this.groupFilterView = new FilterView({
                    url: '/ir/secure/api/v40/workflows/groupTypes',
                    title: $.t('filter.group')
                });

                this.versionFilterView = new FilterView({
                    url: '/ir/secure/api/v40/application/versions',
                    title: $.t('filter.version'),
                    template: versionFilterTemplate
                });

                this.sidebarView = options.sidebar;
                this.sidebarView.model = this.model.get("workflow");
            },

            delegateEvents: function() {
                TemplateView.prototype.delegateEvents.apply(this, arguments);

                this.listenTo(this.gridView, 'rowSelect', this.workflowSelected);
                this.listenTo(this.gridView, 'dataBound', this.selectWorkflow);

                this.listenTo(this.searchView, 'search', this.onSearch);
                this.listenTo(this.typeFilterView, 'filter', this.onFilterType);
                this.listenTo(this.flagFilterView, 'filter', this.onFilterFlag);
                this.listenTo(this.techniqueFilterView, 'filter', this.onFilterTechnique);
                this.listenTo(this.groupFilterView, 'filter', this.onFilterGroup);
                this.listenTo(this.versionFilterView, 'filter', this.onFilterVersion);
            },

            undelegateEvents: function() {
                this.stopListening(this.gridView, 'select');
                this.stopListening(this.gridView, 'dataBound');

                this.stopListening(this.searchView, 'search');
                this.stopListening(this.typeFilterView, 'filter');
                this.stopListening(this.flagFilterView, 'filter');
                this.stopListening(this.techniqueFilterView, 'filter');
                this.stopListening(this.groupFilterView, 'filter');
                this.stopListening(this.versionFilterView, 'filter');

                TemplateView.prototype.undelegateEvents.apply(this, arguments);
            },

            render: function() {
                TemplateView.prototype.render.apply(this, arguments);

                this.gridView.setElement(this.$('#workflows-grid')).render();

                this.searchView.setElement(this.$('#query-form')).render();

                this.typeFilterView.setElement(this.$('#type-filters')).render();
                this.flagFilterView.setElement(this.$('#flag-filters')).render();
                this.techniqueFilterView.setElement(this.$('#technique-filters')).render();
                this.groupFilterView.setElement(this.$('#group-filters')).render();
                this.versionFilterView.setElement(this.$('#version-filters')).render();
            },

            workflowSelected: function(workflow) {
                if (!this.model.has('workflow') || this.model.get('workflow').get('id') !== workflow.get('id')) {
                    // fetch the workflow since the one from the grid is not fully hydrated 
                    workflow.fetch({
                        success: _.bind(this._updateWorkflow, this),
                        error: _.bind(this._updateWorkflow, this)
                    });
                }
            },

            _updateWorkflow: function(workflow) {
                this.model.set('workflow', workflow);
                this.model.updateAttributesFromWorkflow();
                this.sidebarView.setModel(workflow).render();
            },

            selectWorkflow: function() {
                var workflow = this.model.get('workflow');
                if (workflow && workflow.get('id')) {
                    this.gridView.selectRow(workflow.get('id'));
                }
            },

            getState: function() {
                return this.gridView.getState();
            },

            setState: function(state) {
                this.gridView.setState(state);
            },

            onSearch: function(query) {
                if (_.isEmpty(query)) {
                    this.gridView.clearFilter('q');
                } else {
                    this.gridView.addFilter('q', query);
                }
            },

            onFilterType: function(filter) {
                if (_.isEmpty(filter)) {
                    this.gridView.clearFilter('type');
                } else {
                    this.gridView.addFilter('type', filter);
                }
            },

            onFilterFlag: function(filter) {
                if (_.isEmpty(filter)) {
                    this.gridView.clearFilter('flag');
                } else {
                    this.gridView.addFilter('flag', filter);
                }
            },

            onFilterTechnique: function(filter) {
                if (_.isEmpty(filter)) {
                    this.gridView.clearFilter('technique');
                } else {
                    this.gridView.addFilter('technique', filter);
                }
            },

            onFilterGroup: function(filter) {
                if (_.isEmpty(filter)) {
                    this.gridView.clearFilter('group');
                } else {
                    this.gridView.addFilter('group', filter);
                }
            },

            onFilterVersion: function(filter) {
                if (_.isEmpty(filter)) {
                    this.gridView.clearFilter('versionFilter');
                } else {
                    this.gridView.addFilter('versionFilter', filter);
                }
            }

        });

        return WorkflowsView;

    }
);