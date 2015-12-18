/*global define:false */
define(['jquery',
    'underscore',
    'backbone',
    'bootstrap',
    'views/common/dialog',
    'hb!templates/analysis/analysis-send-to-report-generation.html',
    'hb!templates/error.html'],
    function($,
        _,
        Backbone,
        bootstrap,
        Dialog,
        template,
        errorTemplate) {
        'use strict';

        /**
         * A Modal view for sharing or unsharing an analysis. It also shows all current shares.
         *
         * @type {*}
         */
        var AnalysisSendToReportView = Backbone.View.extend({

            template: template,

            tagName: 'div',

            className: 'modal fade',

            initialize: function () {
                this.listenTo(this.model, 'sentForReportGenerationError', this._onSentForReportGenerationError);
            },

            render: function () {
                this.$el.html(this.template({
                    analysisName: this.model.get('name')
                }));
                return this;
            },

            _onSentForReportGenerationError: function (model, responseError) {
                if ((responseError && responseError.errors && responseError.errors.allErrors) &&
                    responseError.status === 400) {
                    this.$('#sendToReportServerErrors').html(errorTemplate(responseError)).show();
                }
            }
        });

        /**
         * Uses the Dialog class to open a dialog with a body view of an AnalysisSendToReportView.
         *
         * @param [viewOptions] passed to the AnalysisSendToReportView constructor
         * @param [dialogOptions] passed to the dialog constructor, except for some overriden properties
         * @param [callback] called if the user chose to send the analysis to the report role
         * @returns {*} views/common/dialog object
         */
        AnalysisSendToReportView.openDialog = function(viewOptions, dialogOptions, callback) {
            var model = viewOptions.model;

            var dialog = Dialog.open(_.extend(dialogOptions || {}, {
                id: 'analysisSendToReportModal',
                headerKey: 'dialog.analysis.sendToReport.title',
                confirmKey: 'dialog.analysis.sendToReport.confirm',
                closeKey: 'dialog.analysis.sendToReport.cancel',
                bodyView: AnalysisSendToReportView,
                autoValidate: false
            }), viewOptions, function(clickEvent) {
                var buttonTarget = $(clickEvent.target).closest(".btn");
                if (buttonTarget.not(":disabled")) {
                    buttonTarget.prop("disabled", true);

                    var errorCallback = function () {
                        model.off("sentForReportGenerationError", errorCallback);
                        buttonTarget.prop("disabled", false);
                    };
                    model.on("sentForReportGenerationError",  errorCallback);
                    model.sendForReportGeneration();
                }
            });
            model.on("sentForReportGeneration", function () {
                callback();
                dialog.$el.modal('hide');
            });
            return dialog;
        };

        return AnalysisSendToReportView;
    }
);
