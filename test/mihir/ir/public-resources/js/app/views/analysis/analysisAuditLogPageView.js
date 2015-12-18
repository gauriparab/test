/*global define:false */
define(['jquery', 'underscore', 'backbone', 'kendo', 'views/common/grid/kendoGridView',
    'views/analysis/analysisAuditLogGridView',
    'models/analysis/analysisAuditLog',
    'hb!templates/analysis/analysis-audit-log-details.html',
    'hb!templates/analysis/analysis-audit-annotations-popover.html',
    'hb!templates/analysis/analysis-audit-workflow-popover.html',
    'hb!templates/analysis/analysis-sample-header.html',
    'hb!templates/analysis/analysis-audit-baseline-popover.html'],
    function($, _, Backbone, kendo, KendoGridView, AnalysisAuditLogGridView, AnalysisAuditLog,
        template, popoverTemplate,
        workflowPopoverTemplate, analysisSampleHeaderTemplate, baselinePopoverTemplate) {
        'use strict';

        /**
         * Analysis overview page
         *
         * @type {*}
         */
        var AnalysisAuditLogPageView = Backbone.View.extend({

            events: {
                'click [data-action="download_audit_log"]': 'downloadAuditLog'
            },

            initialize: function(options) {
                this.options = options || {};
                this.model = new AnalysisAuditLog({
                    analysisAuditLog: this.options.analysisAuditLog
                });
            },

            render: function() {
                var reportData = this.getReportData();
                this.$el.html(template(_.extend(reportData, {
                    analysisSampleHeader: analysisSampleHeaderTemplate
                })));
                this.initializePopovers(reportData);
                this.gridView().render();

                var isMetagenomics = this.model.analysisAuditLog.audited.applicationType === 'METAGENOMICS';
                this.$('#analysisAuditLogSwitchTo').toggle(!isMetagenomics);
            },

            getReportData: function() {
                var reportData = {};
                var analysisData = this.options.analysisAuditLog.audited || {};
                var specimenList = analysisData.specimenGroup && analysisData.specimenGroup.members || [];
                var applicationVersion = analysisData.applicationVersion || {};
                reportData.specimens = [];
                reportData.reportVersion = applicationVersion.name;
                reportData.events = this.options.analysisAuditLog.events;

                reportData.analysis = {
                    id: analysisData.id,
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
                    aborted: analysisData.status === 'ABORTED',
                    stage: analysisData.stage
                };

                for (var i = 0; i < specimenList.length; i++) {
                    var specimen = specimenList[i].specimen;
                    var attributeMap = specimen.attributeValueMap;
                    _.extend(specimen, {
                        gender: attributeMap.Gender,
                        relationship: specimenList[i].role && $.t('specimen.role.' + specimenList[i].role),
                        barcode: specimen.metadata && specimen.metadata['Bar Code'],
                        chiptype: specimen.metadata && specimen.metadata['Chip Type'],
                        chipid: specimen.metadata && specimen.metadata['Chip ID'],
                        libraryPreparation: specimen.metadata && specimen.metadata['Library Preparation'],
                        deviceid: specimen.metadata && specimen.metadata['Device ID']
                    });
                    reportData.specimens[i] = specimen;
                }

                return reportData;
            },

            initializePopovers: function(reportData) {
                if (reportData.analysis.annotations && reportData.analysis.annotations.sources) {
                    this.$('#annotation-details').data('content',
                        popoverTemplate(reportData.analysis.annotations)).popover({
                            html: true,
                            trigger: 'hover'
                        });
                }
                if (reportData.analysis.workflow) {
                    this.$('#workflow-details').data('content',
                        workflowPopoverTemplate(reportData.analysis.workflow)).popover({
                            html: true,
                            trigger: 'hover'
                        });
                }
                if (reportData.analysis.baseline) {
                    this.$('#cnvBaseline').data('content',
                        baselinePopoverTemplate(reportData.analysis.baseline)).popover({
                            html: true,
                            trigger: 'hover'
                        });
                }
            },

            gridView: function() {
                return new AnalysisAuditLogGridView({
                    el: '#auditLogEventContainer',
                    events: this.options.analysisAuditLog.events
                });
            },

            downloadAuditLog: function() {
                var analysisId = this.model.analysisAuditLog.audited.id;
                window.location = '/ir/secure/analyses/' + analysisId + '/download_audit_log';
            }

        });

        return AnalysisAuditLogPageView;

    }
);