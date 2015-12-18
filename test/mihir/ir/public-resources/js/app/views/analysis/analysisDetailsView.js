/*global define:false */
define(['jquery', 'underscore', 'kendo', 'bootstrap',
        'models/analysis/sharedAnalysisModel',
        'collections/sharing/sharedWithCollection',
        'views/analysis/analysisShareModalView',
        'views/templateView',
        'hb!templates/analysis/analysis-details.html',
        'hb!templates/grid/workflow/grid-column-application-type.html',
        'hb!templates/analysis/no-analysis-details.html',
        'hb!templates/analysis/specimen-group-popover-content.html',
        'hb!templates/grid/grid-column-user.html',
        'hb!templates/grid/analysis/grid-column-stage.html'],
    function($, _, kendo, unusedBootstrap, 
            SharedAnalysisModel, SharedWithCollection, AnalysisShareModalView,
            TemplateView, template, applicationTypeTemplate, noSelectionTemplate, specimenGroupPopover, userTemplate, stageTemplate) {
        'use strict';

        /**
         * A view of Analysis details
         *
         * @type {*}
         */
        var AnalysisDetailsView = TemplateView.extend({

            template: template,

            _validOptions: ['canSeeSharingDetails'],

            events: {
                "click #showAnalysisSharingModal": "_onShowSharingClick"
            },

            canSeeSharingDetails: false,

            initialize: function (options) {
                _.extend(this, _.pick(options || {}, this._validOptions));
                if (this.model) {
                    this.listenTo(this.model, 'sync', this.render);
                    this.sharedWithCollection = this._newSharedWithCollection([], {
                        sharedId: this.model.get('id'),
                        model: SharedAnalysisModel,
                        url: '/ir/secure/api/v40/analysis/' + this.model.id +'/share'
                    });
                    this.listenTo(this.sharedWithCollection, 'sync', this.render);
                    this.listenTo(this.sharedWithCollection, 'add', this.render);
                    this.listenTo(this.sharedWithCollection, 'remove', this.render);
                    this.sharedWithCollection.fetch();
                }
            },

            _newSharedWithCollection: function (models, options) {
                return SharedWithCollection.constructOrRetrieve(options.sharedId, options);
            },

            /**
             * Render the template inside container. Add a popover on attachments.
             */
            render: function() {
                if (this.model) {
                    var model = this._modelToJSON();
                    this.$el.html(this.template(_.extend(model, {
                        sub: {
                            userTemplate: userTemplate,
                            stageTemplate: stageTemplate
                        }
                    })));
                    this.$("#specimenGroup").popover({
                        trigger: "hover",
                        placement: "top",
                        content: specimenGroupPopover(model),
                        html: true
                    });
                } else {
                    this._renderNoSelection();
                }
                return this;
            },

            destroy: function() {
                this.model = null;
                this.stopListening();
                this.undelegateEvents();
                this._renderNoSelection();

                return this;
            },

            _onShowSharingClick: function (e) {
                e.preventDefault();
                AnalysisShareModalView.open({
                    analysis: this.model
                });
            },

            _renderNoSelection: function() {
                this.$el.html(noSelectionTemplate());
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
                    status : json.status && $.t('AnalysisStatus.' + json.status),
                    isFailed : json.status && json.status === 'FAILED',
                    isRunning : json.status && json.status === 'RUNNING',
                    progress : Math.round(json.progress),
                    workflow: _.defaults(_.extend(json.workflow || {}, {
                        // fields here that override the default values
                        groupingType: json.workflow && json.workflow.groupingType && $.t(json.workflow.groupingType)
                    }), {
                        // default values here to apply in case of null
                        name: '',
                        groupingType: ''
                    }),
                    startedOn: json.startedOn && kendo.toString(new Date(Date.parse(json.startedOn)),"MMM dd yyyy hh:mm tt"),
                    variantSavedOn: json.variantSavedOn && kendo.toString(new Date(Date.parse(json.variantSavedOn)),"MMM dd yyyy hh:mm tt"),
                    reportPublishedOn: json.reportPublishedOn && kendo.toString(new Date(Date.parse(json.reportPublishedOn)),"MMM dd yyyy hh:mm tt"),
                    reanalysisCount: 0,
                    reannotateCount: 0,
                    subTemplates: {
                        applicationType: applicationTypeTemplate
                    },
                    showBaseline: (json.applicationType === 'DNA' && json.groupingType === 'SINGLE') || json.applicationType === 'ANEUPLOIDY',
                    showSharing: this.canSeeSharingDetails,
                    sharingCount: this.sharedWithCollection.length
                }), {
                    // default values here to apply in case of null
                    name   : '',
                    stage  : '',
                    status : '',
                    isFailed : false,
                    isRunning : false,
                    startedOn: '',
                    variantSavedOn: '',
                    reportPublishedOn: ''
                });
            }

        });

        return AnalysisDetailsView;

    }

);
