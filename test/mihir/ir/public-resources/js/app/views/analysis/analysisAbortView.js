/*global define:false */
define(['jquery',
    'underscore',
    'backbone',
    'bootstrap',
    'views/common/dialog',
    'hb!templates/analysis/analysis-abort.html'].concat('bootstrap.modal', 'bootstrap.modalmanager'),
    function($,
        _,
        Backbone,
        bootstrap,
        Dialog,
        template) {
        'use strict';

        /**
         * A Modal view for aborting an analysis
         *
         * @type {*}
         */
        var AnalysisAbortView = Backbone.View.extend({

            template: template,

            tagName: 'div',

            className: 'modal fade',

            initialize: function () {
                this.listenTo(this.model, 'runAborted', this._onRunAborted);
            },

            render: function () {
                this.$el.html(this.template({
                    analysisName: this.model.get('name')
                }));
                return this;
            },

            _abortAnalysis: function () {
                this.model.abortRun();
            },

            _onRunAborted: function (model) {
                this.trigger('runAborted', model);
            }

        });

        /**
         * Uses the Dialog class to open a dialog with a body view of an AnalysisAbortView.
         *
         * @param [viewOptions] passed to the AnalysisAbortView constructor
         * @param [dialogOptions] passed to the dialog constructor, except for some overriden properties
         * @param [callback] called if the user chose to abort the run
         * @returns {*} views/common/dialog object
         */
        AnalysisAbortView.openDialog = function(viewOptions, dialogOptions, callback) {
            var dialog = Dialog.open(_.extend(dialogOptions || {}, {
                id: 'analysisAbortModal',
                headerKey: 'dialog.analysis.abort.title',
                confirmKey: 'dialog.analysis.abort.confirm',
                closeKey: 'dialog.analysis.abort.cancel',
                confirmBtnClass: 'btn-danger',
                closeBtnClass: 'btn-primary',
                cancelPrimary: true,
                bodyView: AnalysisAbortView,
                autoValidate: false
            }), viewOptions, function(clickEvent, modalView) {
                var buttonTarget = $(clickEvent.target).closest(".btn");
                if (buttonTarget.not(":disabled")) {
                    buttonTarget.prop("disabled", true);
                    modalView.on("runAborted", function () {
                        callback();
                        dialog.$el.modal('hide');
                    });
                    modalView._abortAnalysis();
                }
            });
            return dialog;
        };

        return AnalysisAbortView;
    }
);
