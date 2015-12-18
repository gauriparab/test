/*global define:false*/
define(['backbone', 'models/baseModel', 'underscore', 'jquery', 'data/workflow', 'models/annotationSet',
    'models/filterChain', 'collections/referenceGenomes', 'models/finalReportTemplate',
    'models/targetRegion', 'models/hotspotRegion', 'models/cnvBaseline', 'collections/modules']
    .concat("i18n"),

function(Backbone, BaseModel, _, $, Constants, AnnotationSet, FilterChain, ReferenceGenomes, FinalReportTemplate,
    TargetRegion, HotspotRegion, CNVBaseline, Modules) {

    "use strict";

    var APPLICATION_TYPE = "applicationType",
        SPECIMEN_GROUP = "groupingType",
        REFERENCES = "references",
        TARGET_REGION = "targetRegion",
        VARIANT_TYPE_DETECTION = "variantTypeDetection",
        HOTSPOT_REGION = "hotspotRegion",
        FUSION_PANEL = "fusionPanel",
        ANNOTATION_SET = "annotationSet",
        MODULES = "modules",
        FILTER_CHAIN = "filterChain",
        CNV_BASELINE = "baseline",
        PLUGINS = 'plugins',
        PRIMERS = 'primers',
        REPORT_TEMPLATE = "reportTemplate";

    var TYPES = _.object(_.keys(Constants.ApplicationTypes), _.keys(Constants.ApplicationTypes));
    var GROUPS = _.object(_.keys(Constants.SpecimenGroups), _.keys(Constants.SpecimenGroups));
    var EDIT_WORKFLOW_ACTION = 'EDIT';

    function _isTargetRegionSelectable(attrs) {
        return attrs && (attrs[APPLICATION_TYPE] === TYPES.DNA || attrs[APPLICATION_TYPE] === TYPES.DNA_RNA);
    }

    function _isVariantTypeDetectionSelectable(attrs) {
        return attrs && (attrs[APPLICATION_TYPE] === TYPES.DNA && attrs[SPECIMEN_GROUP] === GROUPS.SINGLE);
    }

    var Workflow = BaseModel.extend({
        urlRoot: '/ir/secure/api/v40/workflows',

        defaults: {
            applicationType: Constants.ApplicationTypes.DNA.identifier
        },

        parse : function(response) {
            if (response.annotationSet) {
                response.annotationSet = new AnnotationSet(response.annotationSet, {parse:true});
            }
            if (response.references) {
                response.references = new ReferenceGenomes(response.references, {parse:true});
            }
            if (response.filterChain) {
                response.filterChain = new FilterChain(response.filterChain, {parse:true});
            }
            if (response.reportTemplate) {
                response.reportTemplate = new FinalReportTemplate(response.reportTemplate, {parse:true});
            }
            if (response.modules) {
                response.modules = new Modules(response.modules, {parse: true});
            }
            if (response.targetRegion) {
                response.targetRegion = new TargetRegion(response.targetRegion, {parse: true});
            }
            if (response.hotspotRegion) {
                response.hotspotRegion = new HotspotRegion(response.hotspotRegion, {parse: true});
            }
            if (response[CNV_BASELINE]) {
                response[CNV_BASELINE] = new CNVBaseline(response[CNV_BASELINE], {parse: true});
            }

            return response;
        },

        toSlimJSON: function() {
            var j = _(this.attributes).clone();
            j.references = this._slimSeq(this.getReferences());
            j.targetRegion = this.getTargetRegion() && _.pick(this.getTargetRegion(), 'id') || null;
            j.variantTypeDetection = this.getVariantTypeDetection() || null;
            j.hotspotRegion = this.getHotSpotRegion() && _.pick(this.getHotSpotRegion(), 'id') || null;
            j.fusionPanel = this.getFusionPanel() && _.pick(this.getFusionPanel(), 'id') || null;
            j.annotationSet = this.getAnnotationSet() && _.pick(this.getAnnotationSet(), 'id') || null;
            j.reportTemplate = this.getReportTemplate() && _.pick(this.getReportTemplate(), 'id') || null;
            j.filterChain = this.getFilterChain() && _.pick(this.getFilterChain(), 'id') || null;
            j.plugins = this._slimSeq(this.get(PLUGINS));
            return j;
        },

        _slimSeq: function(seq) {
            return seq && seq.map(function(item) {
                return _.pick(item, 'id');
            }) || null;
        },

        sync: function slimSync(method, model, options) {
            if (method === 'create' || method === 'update') {
                options.contentType = 'application/json';
                options.data = JSON.stringify(model.toSlimJSON());
            }
            return Backbone.sync(method, model, options);
        },

        lock: function() {
            this.set("status", "LOCKED");
        },

        unlock: function() {
            if (this.id) {
                this.set("status", "PUBLISHED");
            } else {
                this.set("status", "PENDING");
            }
        },

        getApplicationType: function() {
            return this.get(APPLICATION_TYPE);
        },

        setApplicationType: function(type) {
            this.set(APPLICATION_TYPE, type);
        },

        getSpecimenGroup: function() {
            return this.get(SPECIMEN_GROUP);
        },
        
        isRnaSingle: function() {
            return this.get(APPLICATION_TYPE) === TYPES.RNA && this.get(SPECIMEN_GROUP) === GROUPS.SINGLE_RNA_FUSION;  
        },

        setSpecimenGroup: function(group) {
            this.set(SPECIMEN_GROUP, group);
        },

        getReferences: function() {
            return this.get(REFERENCES);
        },

        setReferences: function(references) {
            this.set(REFERENCES, references);
        },

        getTargetRegion: function() {
            return this.get(TARGET_REGION);
        },

        setTargetRegion: function(region) {
            this.set(TARGET_REGION, region);
        },

        isTargetRegionSelectable : function() {
            return _isTargetRegionSelectable(this.attributes);
        },

        isVariantTypeDetectionSelectable : function() {
            return _isVariantTypeDetectionSelectable(this.attributes);
        },

        getVariantTypeDetection: function() {
            return this.get(VARIANT_TYPE_DETECTION);
        },

        setVariantTypeDetection: function(variantTypeDetectionType) {
            this.set(VARIANT_TYPE_DETECTION, variantTypeDetectionType);
        },

        setPrimers: function(primerSequences) {
            this.set(PRIMERS, primerSequences);
        },

        getHotSpotRegion: function() {
            return this.get(HOTSPOT_REGION);
        },

        setHotSpotRegion: function(region) {
            this.set(HOTSPOT_REGION, region);
        },

        getFusionPanel: function() {
            return this.get(FUSION_PANEL);
        },

        setFusionPanel: function(region) {
            this.set(FUSION_PANEL, region);
        },

        isFusionPanelSelectable : function() {
            return _.contains([TYPES.DNA_RNA, TYPES.RNA], this.getApplicationType());
        },

        getAnnotationSet: function() {
            return this.get(ANNOTATION_SET);
        },

        setAnnotationSet: function(annotationSet) {
            this.set(ANNOTATION_SET, annotationSet);
        },

        getFilterChain: function() {
            return this.get(FILTER_CHAIN);
        },

        setFilterChain: function(filterChain) {
            this.set(FILTER_CHAIN, filterChain);
        },

        getModules : function() {
            return this.get(MODULES);
        },

        setModules : function(modules) {
            this.set(MODULES, modules);
        },

        resetModules: function() {
            this.unset(MODULES);
        },

        getBaseline : function() {
            return this.get(CNV_BASELINE);
        },

        setBaseline : function(cnvBaseline) {
            this.set(CNV_BASELINE, cnvBaseline);
        },

        getReportTemplate : function() {
            return this.get(REPORT_TEMPLATE);
        },

        setReportTemplate : function(reportTemplate) {
            this.set(REPORT_TEMPLATE, reportTemplate);
        },

        validations: {
            applicationType: function(attrs) {
                if (!attrs[APPLICATION_TYPE]) {
                    return "workflow.validation.application.missing.application";
                }
            },

            specimenGroup: function(attrs) {
                if (!attrs[SPECIMEN_GROUP]) {
                    return "workflow.validation.application.missing.group";
                }
            },

            checkReferences: function(attrs) {
                if (!attrs[REFERENCES] || attrs[REFERENCES].isEmpty()) {
                    return "workflow.validation.reference.missing.reference";
                }
            },

            checkTargetRegion: function(attrs) {
                var type = attrs[APPLICATION_TYPE];
                if ((type === TYPES.DNA || type === TYPES.DNA_RNA) && !attrs[TARGET_REGION]) {
                    return "workflow.validation.reference.missing.targetRegion";
                }
            },

            checkVariantTypeDetection: function(attrs) {
                if (_isVariantTypeDetectionSelectable(attrs) && !attrs[VARIANT_TYPE_DETECTION]) {
                    return "workflow.validation.reference.missing.variantTypeDetection";
                }
            },

            checkFusionPanel: function(attrs) {
                var type = attrs[APPLICATION_TYPE];
                if (_.contains([TYPES.RNA, TYPES.DNA_RNA], type) && !attrs[FUSION_PANEL]) {
                    return "workflow.validation.reference.missing.fusionPanel";
                }
            },

            finalReport: function(attrs) {
                if (!attrs[REPORT_TEMPLATE]) {
                    return "workflow.validation.reference.missing.reportTemplate";
                }
            }
        },

        getPrimaryAction: function() {
            var allActions = this.get('actions');
            if (_.contains(allActions, EDIT_WORKFLOW_ACTION)) {
                return EDIT_WORKFLOW_ACTION;
            } else {
                return null;
            }
        }
    });

    return Workflow;
});
