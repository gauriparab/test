/*global define:false */
define([
    'jquery',
    'underscore',
    'kendo',
    'collections/modules',
    'views/templateView',
    'views/workflow/moduleParametersPreview',
    'hb!templates/workflow/workflow-details.html',
    'hb!templates/workflow/workflow-primers-popover.html',
    'hb!templates/workflow/workflow-reference-popover-content.html'
].concat(
    'bootstrap'
), function(
    $,
    _,
    kendo,
    Modules,
    TemplateView,
    ModuleParametersPreview,
    template,
    primersTemplate,
    referencesPopoverTemplate
) {
    'use strict';

    /**
     * A view of Workflow details
     *
     * @type {*}
     */
    var WorkflowDetailsView = TemplateView.extend({

        template: template,

        events: {
            'click a#view-parameters-link': '_onViewParameters'
        },

        delegateEvents: function() {
            TemplateView.prototype.delegateEvents.apply(this, arguments);
            this.listenTo(this.model, 'sync', this.render);
        },

        undelegateEvents: function() {
            this.stopListening(this.model);
            TemplateView.prototype.undelegateEvents.apply(this, arguments);
        },

        /**
         * Render the template inside container. Add a popover on attachments.
         */
        render: function() {
            var viewModel = this._modelToJSON();

            this.$el.html(this.template(viewModel));

            this.$('#multipleSelectedReferences').popover({
                trigger: "hover",
                placement: "top",
                content: referencesPopoverTemplate(viewModel),
                html: true
            });

            this.$('div.primers').popover({
                trigger: 'hover',
                placement: 'left',
                content: primersTemplate(viewModel),
                html: true
            });

            return this;
        },

        destroy: function() {
            this.model = null;
            this.stopListening();
            this.undelegateEvents();
            this._renderNoSelection();
            return this;
        },

        _renderNoSelection: function() {
            this.$el.html($.t('workflow.details.no.record.selected'));
        },

        /**
         * Custom analysis serialization for this view.
         *
         * @returns {*}
         * @private
         */
        _modelToJSON: function() {
            var json = this.model.toJSON();
            return _.defaults(_.extend(json, {
                // fields here that override the default values
                name : json.name && $.t(json.name),
                applicationType : json.applicationType,
                groupingType : json.groupingType && $.t(json.groupingType),
                isLocked : json.status === 'LOCKED',
                lastUsedByAnalysisOn : json.lastUsedByAnalysisOn && kendo.toString(new Date(Date.parse(json.lastUsedByAnalysisOn)), 'MMM dd yyyy hh:mm tt'),
                createdBy : json.createdBy && json.createdBy.lastName + ', ' + json.createdBy.firstName,
                createdOn : json.createdOn && kendo.toString(new Date(Date.parse(json.createdOn)), 'MMM dd yyyy hh:mm tt'),
                lastModifiedBy : json.lastModifiedBy && json.lastModifiedBy.lastName + ', ' + json.lastModifiedBy.firstName,
                lastModifiedOn : json.lastModifiedOn && kendo.toString(new Date(Date.parse(json.lastModifiedOn)), 'MMM dd yyyy hh:mm tt'),
                copyNumberBaseline : json.baseline ? json.baseline.name : '',
                pluginNames : json.plugins && _.map(json.plugins, function(plugin) {
                    return plugin.name;
                }),
                reportTemplate : json.reportTemplate ? json.reportTemplate.name : '',
                references: json.references || [],
                targetRegion: _.defaults(_.extend(json.targetRegion || {}, {
                    // fields here that override the default values
                }), {
                    // default values here to apply in case of null
                    name: ''
                }),
                variantTypeDetection : json.variantTypeDetection || '',
                hotspotRegion: _.defaults(_.extend(json.hotspotRegion || {}, {
                    // fields here that override the default values
                }), {
                    // default values here to apply in case of null
                    name: ''
                }),
                annotationSet: _.defaults(_.extend(json.annotationSet || {}, {
                    // fields here that override the default values
                }), {
                    // default values here to apply in case of null
                    name: ''
                }),
                filterChain: _.defaults(_.extend(json.filterChain || {}, {
                    // fields here that override the default values
                }), {
                    // default values here to apply in case of null
                    name: ''
                }),
                fusionPanel: json.fusionPanel ?  (_.defaults(_.extend(json.fusionPanel || {}, {
                    // fields here that override the default values
                }), {
                    // default values here to apply in case of null
                    name: ''
                })) : ''
            }), {
                // default values here to apply in case of null
                name : '',
                description : '',
                groupingType : '',
                pluginNames : [],
                lastUsedByAnalysisOn : '',
                createdBy : '',
                createdOn : '',
                lastModifiedBy : '',
                lastModifiedOn : '',
                primersHtmlData: ''
            });
        },

        _onViewParameters: function() {
            var modules = new Modules(),
                self = this;
            modules.getAllowed(this.model).done(function() {
                ModuleParametersPreview.open({
                    modules: modules,
                    title: $.t('workflow.parameters.preview.title', { workflowName: self.model.get('name')})
                });
            });
        }

    });

    return WorkflowDetailsView;
});
