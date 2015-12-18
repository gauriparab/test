/* global define:false */
define(['jquery',
    'underscore',
    'kendo',
    'views/templateView',
    'models/analysis/analysisModel',
    'hb!templates/analysis/qc_report.html',
    'hb!templates/analysis/analysis-sample-header.html',
    'hb!templates/analysis/analysis-audit-annotations-popover.html',
    'hb!templates/analysis/analysis-audit-workflow-popover.html',
    'hb!templates/analysis/analysis-audit-baseline-popover.html'],
    function($, _, kendo, TemplateView, AnalysisModel, qcReportTemplate, analysisSampleHeaderTemplate,
        popoverTemplate, workflowPopoverTemplate, baselinePopoverTemplate) {
        'use strict';

        var QCOverviewPage = TemplateView.extend({

            events: {
                'click [data-action="view_audit_log"]': 'viewAuditLog'
            },

            _template: qcReportTemplate,

            reportVersion: '',

            _excludedSampleAttributes: ['Gender'],

            initialize: function(opts) {
                var options = opts || {};
                this.model = options.analysis;
                this.qcMetricsList = options.qcMetricsList;
                var applicationVersion = this.model.applicationVersion || {};
                this.reportVersion = applicationVersion.name;
            },

            _getQCReportData: function() {
                var qcData = {};
                var analysisData = this.model || {};
                var specimenList = analysisData.specimenGroup && analysisData.specimenGroup.members || [];
                qcData.reportVersion = this.reportVersion;
                qcData.specimens = [];
                qcData.qcTitles = [];
                qcData.qcMetrics = [];

                qcData.analysis = {
                    name: analysisData.name,
                    importedby: analysisData.createdBy &&
                                analysisData.createdBy.firstName + ' ' + analysisData.createdBy.lastName,
                    analyzedby: analysisData.analyzedBy &&
                                analysisData.analyzedBy.firstName + ' ' + analysisData.analyzedBy.lastName,
                    date_imported: analysisData.createdOn &&
                                   kendo.toString(new Date(Date.parse(analysisData.createdOn)),
                                       "MMMM d, yyyy hh:mm tt"),
                    date_analyzed: analysisData.lastModifiedOn &&
                                   kendo.toString(new Date(Date.parse(analysisData.lastModifiedOn)),
                                       "MMMM d, yyyy hh:mm tt"),
                    workflow: analysisData.workflow,
                    annotations: analysisData.annotationSet,
                    baseline: analysisData.baseline,
                    references: analysisData.references && analysisData.references.length > 0 ?
                                analysisData.references : null,
                    stage: analysisData.stage
                };

                qcData.id = analysisData.id;

                var qcKeys = _.union(_.flatten(this._getAllQCKeys()));
                qcData.qcMetrics = _.map(qcKeys, function(aKey) {
                    return {
                        key: aKey,
                        value: []
                    };
                });

                _.each(specimenList, function(specimen, i) {
                    var role = specimen.role || '';
                    var roleText = $.t('specimen.role.' + role);
                    specimen = specimen.specimen;

                    var attributeMap = specimen.attributeValueMap;
                    var specimenName = specimen.name;

                    specimen.attributes = _.reject(specimen.attributes, function(specimenAttribute) {
                        return _.contains(this._excludedSampleAttributes, specimenAttribute.attribute.name);
                    }, this);

                    qcData.specimens[i] = _.extend(specimen, {
                        gender: attributeMap.Gender,
                        relationship: roleText,
                        barcode: specimen.metadata && specimen.metadata['Bar Code'],
                        chiptype: specimen.metadata && specimen.metadata['Chip Type'],
                        chipid: specimen.metadata && specimen.metadata['Chip ID'],
                        libraryPreparation: specimen.metadata && specimen.metadata['Library Preparation'],
                        deviceid: specimen.metadata && specimen.metadata['Device ID']
                    });

                    qcData.qcTitles[i] = {
                        'title': specimenName + ' (' + roleText + ')',
                        'samplename': specimenName
                    };

                    this._adjustAllMetricValues(specimen.id, qcKeys, qcData.qcMetrics);
                }, this);

                return qcData;
            },

            _getSpecimenQcMetrics: function(specimenId) {
                var matchingSpecimens = _.filter(this.qcMetricsList, function(qcMetrics) {
                    var specimen = qcMetrics.$$specimen$$;
                    return specimen && specimenId && specimen.id === specimenId;
                });
                return matchingSpecimens && matchingSpecimens.length > 0 && matchingSpecimens[0] || {};
            },

            _adjustAllMetricValues: function(specimenId, allKeys, metricsResults) {
                var specimenMetrics = this._getSpecimenQcMetrics(specimenId);
                _.each(allKeys, function(aKey) {
                    var value = _.has(specimenMetrics, aKey) ? specimenMetrics[aKey] : '';
                    var metricsEntry = _.findWhere(metricsResults, {key: aKey});
                    metricsEntry.value.push(value);
                });
            },

            _getAllQCKeys: function() {
                return _.map(this.qcMetricsList, function(qcM) {
                    return _.keys(_.omit(qcM, '$$specimen$$'));
                });
            },

            render: function() {
                var qcData = this._getQCReportData();
                this.$el.html(this._template(_.extend(qcData, {
                    analysisSampleHeader: analysisSampleHeaderTemplate
                })));
                this.initializePopovers(qcData);
            },

            initializePopovers: function(qcData) {
                if (qcData.analysis.annotations && qcData.analysis.annotations) {
                    this.$('#annotation-details').data('content',
                            popoverTemplate(qcData.analysis.annotations)).popover({
                        html: true,
                        trigger: 'hover'
                    });
                }
                if (qcData.analysis.workflow) {
                    this.$('#workflow-details').data('content',
                            workflowPopoverTemplate(qcData.analysis.workflow)).popover({
                        html: true,
                        trigger: 'hover'
                    });
                }
                if (qcData.analysis.baseline) {
                    this.$('#cnvBaseline').data('content',
                        baselinePopoverTemplate(qcData.analysis.baseline)).popover({
                            html: true,
                            trigger: 'hover'
                        });
                }
            },

            viewAuditLog: function() {
                var analysisId = this.model.id;
                window.location = '/ir/secure/analyses/' + analysisId + '/audit_log';
            }
        });

        return QCOverviewPage;

    });
