/*global define:false */
define([ 'jquery', 'underscore', 'views/formView', 'events/eventDispatcher',
        'i18n', 'hb!templates/workflow-confirm.html' ], function($, _,
        FormView, dispatcher, i18n, template) {

    "use strict";

    var WorkflowView = FormView.extend({
        // FormView
        submitButtonSelector : '#save-workflow',

        initialize : function() {
            this.isValid = false;
        },

        events : {
            "keyup input#workflow-name" : "validateWorkflowName",
            "change input#workflow-name" : "changeName",
            "change textarea#workflow-desc" : "changeDescription",
            "click #lockWorkflow" : "toggleWorkflowLock"
        },

        render : function() {
            this.$el.html(template(this.model.toJSON()));
            this.validateWorkflowName();
            this.$('#workflow-name').focus();
            return this;
        },

        validateWorkflowName : function() {
            var name = this.$('#workflow-name').val();
            var lengthValid = this.isWorkflowNameLengthValid(name);
            var nameValid = this.isWorkflowNameValid(name);
            $("#workflow-name + span").remove();

            $("#workflow-name").closest(".control-group").toggleClass("error",
                    !nameValid || !lengthValid);
            $(this.submitButtonSelector).toggleClass("disabled", !nameValid || !lengthValid);

            if (!nameValid) {
                this.displayWorkflowNameError(i18n.t('workflow.validation.name.valid.characters'));
            } else if (!lengthValid) {
                this.displayWorkflowNameError(i18n.t('workflow.validation.name.length'));
            }
        },

        isWorkflowNameLengthValid: function(name) {
            return name.length >= 1 && name.length <= 256;
        },

        isWorkflowNameValid : function(name) {
            return !/[^\w_\-\. ]/.test(name);
        },

        displayWorkflowNameError: function(message) {
            var errorMessage = $("<span/>").addClass("help-inline").text(message);
            $("#workflow-name").after(errorMessage);
        },

        changeName : function(evt) {
            this.changed(evt);
        },

        changeDescription : function(evt) {
            this.changed(evt);
        },

        changed : function(evt) {
            var changed = evt.currentTarget;
            var value = $(evt.currentTarget).val();
            var obj = {};

            obj[changed.name] = value;
            this.model.set(obj);
        },

        toggleWorkflowLock : function() {
            // if (this.model.get("status") === "LOCKED") {
            // this.model.unlock();
            // } else {
            // this.model.lock();
            // }
        },

        // FormView
        save : function() {
            var wizard = this.options.parent;
            var originalModel = wizard.originalModel;
            wizard.stopModuleMonitoring();
            this.model.save(_.extend(originalModel.toJSON() || {}, this.model
                    .toJSON()), {
                success : this.onSaveSuccess,
                include : []
            }).always(function() {
                wizard.startModuleMonitoring();
            });
        },

        onSaveSuccess : function(model/* , response */) {
            window.location = "/ir/secure/workflows.html/" + model.id + "/?saved=true";
        }

    });

    return WorkflowView;
});