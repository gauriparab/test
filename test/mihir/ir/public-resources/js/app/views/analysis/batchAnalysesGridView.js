/*global define:false*/
define([
    'jquery',
    'underscore',
    'views/common/grid/kendoGridView',
    'hb!templates/analysis/plugin-popover-content.html',
    'hb!templates/analysis/specimen-group-popover-content.html',
    'hb!templates/analysis/batch-analysis-workflow.html'
], function(
    $,
    _,
    KendoGridView,
    pluginPopoverTemplate,
    specimenGroupPopoverTemplate,
    workflowTemplate
) {
    'use strict';

    var _SEPARATOR = '___$$$$___';
    var _FIELD_SEPARATOR = '___$$:$$___';
    var _WORKFLOW_SEPARATOR = '___$$+$$___';

    var Transport = KendoGridView.Transport.extend({
        read: function(options) {
            var analyses = this._grid._batchAnalysis.get('launchables').map(function(analysis) {
                return {
                    analysis: analysis.toJSON()
                };
            });
            options.success.call(this, {content: analyses});
        }
    });

    var BatchAnalysesGridView = KendoGridView.extend({

        _fields: {
            name: {
                type: 'string'
            },
            applicationType: {
                type: 'string'
            },
            groupingType: {
                type: 'string'
            },
            workflow: {
                type: 'object'
            },
            specimenGroup: {
                type: 'object'
            },
            plugins: {
                type: 'array'
            }
        },

        _transportCls: Transport,

        initialize: function(opts) {
            var options = opts || {};

            KendoGridView.prototype.initialize.call(this, _.extend(options, {
                groupable: false,
                scrollable: false,
                selectable: false,
                sortable: true,
                editable: false,
                pageable: true,
                serverSorting: false,
                serverPaging: false
            }));

            this._total = this._getTotal;
        },

        _columns: function() {
            return [
                this.cb()
                    .field('analysis.name')
                    .title('Name')
                    .template('#= analysis.name #')
                    .build(),
                this.cb()
                    .field('analysis.applicationType')
                    .title('Application Type')
                    .template('#= $.t("WorkflowApplicationType." + analysis.applicationType) #')
                    .build(),
                this.cb()
                    .field('analysis.groupingType')
                    .title('Grouping Type')
                    .template('#= analysis.groupingType ? $.t("WorkflowSpecimenGroupType." + analysis.groupingType) : "" #')
                    .build(),
                this.cb()
                    .field('workflow.name')
                    .title('Workflow')
                    .template(workflowTemplate)
                    .build(),
                this.cb()
                    .field('specimenGroup.members.length')
                    .title('Samples')
                    .width(50)
                    .template(this._renderSamples)
                    .build(),
                this.cb()
                    .field('plugins.length')
                    .title('Plugins')
                    .sortable(false)
                    .width(50)
                    .template(this._renderPlugins)
                    .build()
            ];
        },

        _getTotal: function(result) {
            var data = this.data(result);
            return data ? data.length : 0;
        },

        render: function() {

            KendoGridView.prototype.render.call(this);
            
            this.$('a[data-is-plugin="true"]').each(function() {
                var dataPlugins = $(this).data('plugins').split(_SEPARATOR);
                var plugins = _.map(dataPlugins, function(plugin) {
                    return {
                        name: plugin
                    };
                });
                $(this).popover({
                    trigger: 'hover', 
                    placement: 'top', 
                    content: pluginPopoverTemplate({plugins: plugins}), 
                    html: true,
                    container: '#batch-launch'
                });
            });

            this.$('a[data-is-specimen="true"]').each(function() {
                var specimen = $(this).data('specimens').split(_WORKFLOW_SEPARATOR);
                var workflowApplicationType = specimen[1];
                var dataSpecimens = specimen[0].split(_SEPARATOR);
                var specimens = _.map(dataSpecimens, function(specimenName) {
                    var specimenWithRole = specimenName.split(_FIELD_SEPARATOR);
                    return {
                        role: specimenWithRole[1],
                        specimen: {
                            name: specimenWithRole[0]
                        }
                    };
                });
                $(this).popover({
                    trigger: 'hover', 
                    placement: 'top', 
                    content: specimenGroupPopoverTemplate({
                        workflow: {
                            applicationType: workflowApplicationType
                        },
                        specimenGroups: [{
                            members: specimens
                        }]
                    }),
                    html: true,
                    container: '#batch-launch'
                });
            });

            this.$('a[data-is-workflow="true"]').each(function() {
                $(this).popover({
                    trigger: 'hover',
                    placement: 'top',
                    html: true,
                    container: '#batch-launch'
                });
            });
        },

        setBatchAnalysis: function(batchAnalysis) {
            this._batchAnalysis = batchAnalysis;
        },

        _parseResponse: function(response) {
            response.content = _.map(response.content, function(value) {
                var analysis = value.analysis;
                return {
                    analysis : analysis,
                    workflow : analysis.workflow,
                    plugins : analysis.plugins,
                    specimenGroup : analysis.specimenGroup
                };
            });
            return response;
        },

        _renderPlugins: function(dataItem) {
            if (dataItem.plugins && dataItem.plugins.length > 0) {
                var pluginNames = _.map(dataItem.plugins, function(plugin) {
                    return plugin.name;
                }, this).join(_SEPARATOR);

                return '<a href="javascript:void(0)" data-is-plugin="true" data-plugins="' + pluginNames + '">'  +
                        '<span style="margin:20px;">' + dataItem.plugins.length + '</span>' +
                        '</a>';
            } else {
                return $.t('batch.analysis.entry.noPlugins');
            }
        },
        
        _renderSamples: function(dataItem) {
            if (dataItem.specimenGroup && 
                    dataItem.specimenGroup.members && 
                    dataItem.specimenGroup.members.length > 0) {
                var specimens = _.map(dataItem.specimenGroup.members, function(specimenRelationShip) {
                    return (specimenRelationShip.specimen && specimenRelationShip.specimen.name || '') +
                           _FIELD_SEPARATOR +
                           specimenRelationShip.role;
                }, this).join(_SEPARATOR).concat(_WORKFLOW_SEPARATOR).concat(dataItem.workflow.applicationType);

                return '<a href="javascript:void(0)" data-is-specimen="true" data-specimens="' + specimens + '">' +
                        '<span style="margin:20px;">' + dataItem.specimenGroup.members.length + '</span>' +
                        '</a>';
            } else {
                return '';
            }
        }
    });

    return BatchAnalysesGridView;
});
