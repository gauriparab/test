/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'models/baseModel', 'models/workflow/workflowModel', 'models/analysis/specimenGroupModel',
    'models/plugin', 'models/filterChain', 'models/finalReportTemplate', 'models/annotationSet'],
    function($, _, Backbone, BaseModel, Workflow, SpecimenGroup, Plugin, FilterChain, FinalReportTemplate, AnnotationSet) {
        'use strict';

        var EDIT_ANALYSIS_ACTION = 'EDIT_VARIANTS',
            VIEW_ANALYSIS_ACTION = 'VIEW_VARIANTS',
            VIEW_METAGENOMICS_ACTION = 'VIEW_METAGENOMICS';
        /**
         * Backbone model of an Analysis entity
         *
         * @type {*}
         */
        var AnalysisModel = BaseModel.extend({

            urlRoot: '/ir/secure/api/v40/analysis',

            defaults: function() {
                return {
                    stage: 'ANALYSIS',
                    status: 'PENDING',
                    progress: 0,
                    flagged: false,
                    specimenGroups: new Backbone.Collection()
                };
            },

            getActions: function() {
                var allActions = this.get('actions');
                return _.without(allActions, 'PREVIEW_FINAL_REPORT', 'PUBLISH_FINAL_REPORT',
                    'EXPORT_AUDIT_LOG', 'EXPORT_QC_PACKAGE', 'EXPORT_QC_REPORT');
            },

            getPrimaryAction: function() {
                var allActions = this.get('actions');
                if (_.contains(allActions, VIEW_METAGENOMICS_ACTION)) {
                    return VIEW_METAGENOMICS_ACTION;
                } else if (_.contains(allActions, EDIT_ANALYSIS_ACTION)) {
                    return EDIT_ANALYSIS_ACTION;
                } else if (_.contains(allActions, VIEW_ANALYSIS_ACTION)) {
                    return VIEW_ANALYSIS_ACTION;
                } else {
                    return null;
                }
            },

            getStage: function() {
                var stage = this.get('stage');
                if (this.get('applicationType') === 'METAGENOMICS' && stage === 'VARIANT_REVIEW'){
                    return 'metagenomics_review';
                } else {
                    return stage.toLowerCase();
                }
            },

            areVariantFavoritesViewable: function() {
                return this.isSuccessful() &&
                    _.contains(['DNA', 'ANEUPLOIDY', 'ANNOTATE_VARIANTS', 'RNA', 'DNA_RNA'],
                        this.get('applicationType'));
            },

            isSuccessful: function() {
                return this.get('status') === 'SUCCESSFUL';
            },

            isReportPublished: function() {
                return this.get('stage') === 'REPORT_PUBLISHED';
            },

            isShared: function() {
                return this.get('shared') && this.get('sharedBy');
            },

            canShare: function() {
                return _.contains(this.get('actions'), 'SHARE');
            },

            /**
             * Field based validations
             */
            validations : {
                name : function(attrs) {
                    if (!attrs.name || !attrs.name.match(/(^[\w -.]{1,256}$)/)) {
                        return 'analysis.error.name';
                    }
                },
                
                // An analysis must have a single-sample workflow set
                workflow: function(attrs) {
                    if (!attrs.workflow) {
                        return 'analysis.error.workflow';
                    }
                },
                // An analysis must have a sample group selected
                specimenGroup: function(attrs) {
                    var ret = !(attrs.specimenGroup && attrs.specimenGroup.get('members').length) &&
                        !attrs.specimenGroups.length &&
                        'analysis.error.specimenGroup';
                    return ret;
                },

                // Specimen groups are not part of the server model, multiple analysis will be created if necessary when
                // an analysis has multiple groups, but this should be ignored on an edit operation. See IR-7687.
                specimenGroups: function(attrs) {
                    if (this.isNew() && attrs.workflow &&
                        _.contains(["TRIO", "PAIRED_TUMOR_NORMAL", "PAIRED", "DNA_RNA_FUSION"], attrs.workflow.getSpecimenGroup())) {
                        if (attrs.specimenGroups && attrs.specimenGroups.length) {
                            return !attrs.specimenGroups.every(function(group) {
                                return group.isValidRelationship();
                            }) && "analysis.error.specimen.group.not.fully.defined";
                        } else {
                            return "analysis.error.specimen.group.missing";
                        }
                    }
                },

                duplicateSpecimenGroups: function(attrs) {
                    if (attrs.specimenGroups && attrs.specimenGroups.length) {
                        var names = {};
                        for (var i = 0; i < attrs.specimenGroups.length; i++) {
                            var specimen = attrs.specimenGroups.at(i);
                            if (names[specimen.get("name")]) {
                                return "analysis.error.duplicate.specimen.group.name";
                            } else {
                                names[specimen.get("name")] = specimen;
                            }
                        }
                    }
                }

            },

            initialize: function() {
                this.attributes = this.parse(this.attributes || {});
            },

            abortRun: function () {
                $.ajax({
                    url: '/ir/secure/api/v40/analysis/' + this.get('id') + '/abort',
                    type: 'POST',
                    success: _.bind(this._onAbortRunSuccess, this)
                });
            },

            _onAbortRunSuccess: function () {
                this.trigger("runAborted", this);
            },

            sendForReportGeneration: function () {
                $.ajax({
                    url: '/ir/secure/api/v40/analysis/' + this.get('id') + '/sendForReportGeneration',
                    type: 'POST',
                    success: _.bind(this._onSendForReportGenerationSuccess, this),
                    error: _.bind(this._onSendForReportGenerationError, this)
                });
            },

            _onSendForReportGenerationSuccess: function (resp) {
                this.set(this.parse(resp));
                this.trigger("sentForReportGeneration", this);
                this.trigger("sync", this, resp, {});
            },

            _onSendForReportGenerationError: function (xhr) {
                var responseError = null;
                if (xhr.getResponseHeader('content-type').indexOf("application/json") !== -1) {
                    responseError = JSON.parse(xhr.responseText);
                }
                this.trigger("sentForReportGenerationError", this, responseError);
            },

            /**
             * 'Slimmer' JSON for the purpose of object creation
             *
             * @returns {*}
             */
            toSlimJSON: function() {
                var json = _.clone(this.attributes);
                json.workflow = this.attributes.workflow && _.pick(this.attributes.workflow, 'id') || null;
                json.specimenGroup = this.attributes.specimenGroup && this.attributes.specimenGroup.toSlimJSON() || null;
                json.plugins = this.get("plugins") && _.map(this.get("plugins"), function(plugin) {
                    return _.pick(plugin, 'id');
                }) || null;
                return json;
            },

            /**
             * Custom model parsing, workflow and specimenGroup are models
             *
             * @param resp
             * @returns {*}
             */
            parse: function(resp) {
                if (_.isObject(resp.workflow) && !(resp.workflow instanceof Workflow)) {
                    resp.workflow = new Workflow(resp.workflow);
                }
                if (_.isObject(resp.specimenGroup) && !(resp.specimenGroup instanceof SpecimenGroup)) {
                    resp.specimenGroup = new SpecimenGroup(resp.specimenGroup);
                }
                if (_.isObject(resp.filterChain) && !(resp.filterChain instanceof FilterChain)) {
                    resp.filterChain = new FilterChain(resp.filterChain);
                }
                return resp;
            },

            updateAttributesFromWorkflow: function() {
                var workflow = this.get('workflow');
                this._updatePluginsFromWorkflow(workflow);
                this._updateAnnotationSetFromWorkflow(workflow);
                this._updateFilterChainFromWorkflow(workflow);
                this._updateReportTemplateFromWorkflow(workflow);
            },

            _updatePluginsFromWorkflow: function(workflow) {
                var wfPlugins = workflow && workflow.get('plugins') || [];
                this.set('plugins', _.map(wfPlugins, function(plugin) {
                    if (_.isObject(plugin) && !(plugin instanceof Plugin)) {
                        return new Plugin(plugin);
                    } else {
                        return plugin;
                    }
                }));
            },
            
            _updateAnnotationSetFromWorkflow: function(workflow) {
                var wfAnnotationSet = workflow && workflow.get('annotationSet') || null;
                if (wfAnnotationSet && !(wfAnnotationSet instanceof AnnotationSet)) {
                    wfAnnotationSet = new AnnotationSet(wfAnnotationSet);
                }
                this.set('annotationSet', wfAnnotationSet);
            },

            _updateFilterChainFromWorkflow: function(workflow) {
                var wfFilterChain = workflow && workflow.get("filterChain") || null;
                if (wfFilterChain && !(wfFilterChain instanceof FilterChain)) {
                    wfFilterChain = new FilterChain(wfFilterChain);
                }
                this.set('filterChain', wfFilterChain);
            },

            _updateReportTemplateFromWorkflow: function(workflow) {
                var finalReportTemplate = workflow && workflow.get('reportTemplate') || null;
                if (finalReportTemplate && !(finalReportTemplate instanceof FinalReportTemplate)) {
                    finalReportTemplate = new FinalReportTemplate(finalReportTemplate);
                }
                this.set('reportTemplate', finalReportTemplate);
            },

            getFilterChain: function() {
                var filterChain = this.get('filterChain');
                if (filterChain && !(filterChain instanceof FilterChain)) {
                    filterChain = new FilterChain(filterChain);
                }
                return filterChain;
            },

            setFilterChain: function(fc) {
                this.set('filterChain', fc);
            },
            
            getChromosomes: function(success) {
                $.ajax({
                    type : 'GET',
                    url : '/ir/secure/api/v40/analysis/' + this.id + '/chromosomes',
                    success: success
                });
            },

            autogenerateName: function() {
                var specimenGroup = this.get('specimenGroup');
                if (specimenGroup) {
                    var name = specimenGroup.get('name') || specimenGroup.get('members').at(0).get('specimen').get('name'),
                        stamp = function(n) {
                            return n + '_' + specimenGroup.cid + '_' + (+new Date());
                        };
                    // make name valid for Analysis
                    name = name.substr(0,230);
                    this.set('name', stamp(name));
                }
            },

            synchronousCheckIn: function(onError) {
                $.ajax({
                    type : 'POST',
                    dataType : 'json',
                    contentType : 'application/json',
                    url : '/ir/secure/api/v40/analysis/' + this.id + '/checkin',
                    async : false
                }).fail(function(xhr, error) {
                    if (_.isFunction(onError)) {
                        onError(error);
                    }
                });
            }

        });

        return AnalysisModel;
    });
