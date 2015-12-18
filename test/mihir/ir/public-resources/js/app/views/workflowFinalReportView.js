/*global define:false*/
define(['underscore', 
        'backbone',
        'collections/workflowFinalReports', 
        'views/ParentView',
        'views/workflowFinalReportTemplateSelectionView', 
        'views/reportTemplateSectionsView', 
        'views/finalReportTemplate/finalReportTemplateEditControlsView',
        'views/common/bannersView',
        'events/eventDispatcher',
        'hb!templates/workflow-finalreport.html']
        .concat('bootstrap.select'), 
       function (_, 
               Backbone,
               WorkflowFinalReports, 
               ParentView,
               WorkflowFinalReportTemplateSelectionView,
               ReportTemplateSectionsView, 
               FinalReportTemplateEditControlsView,
               BannerView,
               dispatcher,
               reportTemplate) {
    "use strict";

    var WorkflowFinalReportView = ParentView.extend({

        initialize: function() {
            this.model = this.options.model || null;
            this._allowedFinalReports = new WorkflowFinalReports();
            this._reportTemplateSelectionView = new WorkflowFinalReportTemplateSelectionView({
                model: this.model,
                collection: this._allowedFinalReports
            });
            this._reportTemplateSectionsView = new ReportTemplateSectionsView({
                model : this.model
            });
            this._finalReportTemplateEditControlsView = new FinalReportTemplateEditControlsView({
                _dialogSelector: '#final-report-template-dialog',
                _finalReportTemplate: null,
                onSuccessfulCreate: _.bind(this._onNewFinalReportTemplateCreated, this),
                onSuccessfulUpdate: _.bind(this._onFinalReportTemplateUpdated, this)
            });
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
            this.listenTo(this.model, 'change:reportTemplate', this._renderSelectedTemplateDetails);
        },

        undelegateEvents: function() {
            this.stopListening(this.model, 'change:reportTemplate', this._renderSelectedTemplateDetails);
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
            this.$el.html(reportTemplate());
            this._finalReportTemplateEditControlsView.setElement(this.$('#report-template-controls')); 
            
            if (this._allowedFinalReports.length > 0) {
                this._renderReportTemplates();
            } else {
                this._allowedFinalReports.getAllowed(this.model, _.bind(this._renderReportTemplates, this));
            }

            return this;
        },

        _renderReportTemplates: function() {
            if (!this.model.getReportTemplate()) {
                //Set the selected to the first Ion Default report template in the list of available final report templates; 
                this.model.setReportTemplate(this._allowedFinalReports.getFirstFactoryProvided());
            }
            this.renderSubView(this._reportTemplateSelectionView, '#report-template-select');
            this._renderSelectedTemplateDetails();
        },

        _renderSelectedTemplateDetails: function() {
            dispatcher.trigger('finalReportTemplate:selectionChanged', this.model.getReportTemplate()); //is this the right location
            this.renderSubView(this._reportTemplateSectionsView, '#workflow-report-sections');
        },
        
        _onNewFinalReportTemplateCreated: function(newFRT) {
            this._getCompletePresetModalFunc('workflow.final.report.template.successful.creation');
            this._allowedFinalReports.add(newFRT);
            this.model.setReportTemplate(newFRT);
        },

        _onFinalReportTemplateUpdated: function(updatedFRT) {
            this._getCompletePresetModalFunc('workflow.final.report.template.successful.modification');
            this.model.setReportTemplate(updatedFRT);
            var localFRT = this._allowedFinalReports.get(updatedFRT);
            if (localFRT) {
                localFRT.set(updatedFRT.attributes);
            }
        },
        
        _getCompletePresetModalFunc: function(messageKey) {
            BannerView.show({
                container: this.$('#final-report-messages'),
                style: 'success',
                titleKey: messageKey
            });
        }

    });

    return WorkflowFinalReportView;
});
