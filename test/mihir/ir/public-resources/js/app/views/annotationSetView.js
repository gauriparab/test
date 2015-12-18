/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'hb!templates/annotation-set.html', 'models/annotationSet',
    'collections/annotationSourceCollection', 'views/annotationSetSourceView',
    'views/annotationSetSelectedSourcesView','views/formView', 'views/errorsView'],
    function($, _, Backbone, template, AnnotationSet, AnnotationSourceCollection, AnnotationSetSourceView,
             AnnotationSetSelectedSourcesView, FormView, ErrorsView) {

    "use strict";

    var AnnotationSetView = FormView.extend({

        valid: /(^$)|(^[A-Za-z0-9_\-\. ]{1,256}$)/,

        // flag that is set when we are in the process of saving
        saving: false,

        // FormView
        submitButtonSelector: '#annotation-set-btn-save',

        initialize: function() {

            this.annotationSet = this.model || null;
            this.sources = this.collection || null;
            this.typeCollection = this.options.typeCollection || null;

            if (!this.annotationSet.has("sources")) {
                this.annotationSet.set({sources: new AnnotationSourceCollection()});
            }

            // enable/disable the save button...
            this.listenTo(this.annotationSet, 'change', this.enableDisableSaveButton);
            this.listenTo(this.annotationSet.get("sources"), 'add', this.enableDisableSaveButton);
            this.listenTo(this.annotationSet.get("sources"), 'remove', this.enableDisableSaveButton);

            this.annotationSetSourceView = new AnnotationSetSourceView({
                collection: this.sources,
                typeCollection: this.typeCollection,
                model: this.annotationSet
            });

            this.errorsView = new ErrorsView({
                model: this.annotationSet
            });

            this.annotationSetSelectedSourcesView = new AnnotationSetSelectedSourcesView({
                model: this.annotationSet
            });
        },

        events: {
            'click #annotation-set-btn-cancel': 'closeDialog',
            'click a.annotation-set-btn-trash': 'trash',
            'change input.annotation-set-input': 'enableDisableSaveButton',
            'keyup input.annotation-set-input': 'enableDisableSaveButton',
            'keyup input#annotation-set-name' : 'validateName'
        },

        enableDisableSaveButton: function() {
            // if we are already in the process of saving, then don't do this check
            if (this.saving !== true) {
                var settingName = this.$el.find('input#annotation-set-name').val();

                $('.control-group').toggleClass('error', !this.valid.test(settingName));
                if (settingName && this.annotationSet.has("sources") && this.annotationSet.get("sources").length && this.valid.test(settingName)) {
                    this.enableButton(this.submitButtonSelector);
                } else {
                    this.disableButton(this.submitButtonSelector);
                }
            }

        },

        render: function() {
            this.$el.html(template({
                action : this.options.action,
                name : this.annotationSet.get("name"),
                description : this.annotationSet.get("description")
            }));

            this.renderSubView(this.errorsView, "#errors");
            this.renderSubView(this.annotationSetSourceView, "#annotation-set-source");
            this.renderSubView(this.annotationSetSelectedSourcesView, "#annotation-set-selected-sources");
            this.enableDisableSaveButton();
            return this;
        },

        closeDialog : function() {
            this.$el.modal('hide');
            this.undelegateEvents();
        },

        save: function() {
            this.saving = true;

            var settingName = this.$el.find('input#annotation-set-name').val();
            var settingDescription = this.$el.find('input#annotation-set-desc').val();

            this.annotationSet.set({name: settingName, description: settingDescription});
            this.annotationSet.save({}, {
                success: $.proxy(this.success, this),
                error: $.proxy(this.error, this)
            });
        },

        trash: function(e) {

            e.preventDefault();

            var $currentTarget = $(e.currentTarget);
            var selectedAnnotationSourceId = $currentTarget.data('cid');
            var selectedAnnotationSource = this.annotationSet.get("sources").get(selectedAnnotationSourceId);

            this.annotationSet.get("sources").remove(selectedAnnotationSource);
        },

        success: function(model, response) {
            this.saving = false;
            if (this.options.onComplete && _.isFunction(this.options.onComplete)) {
                var annotationSet = new AnnotationSet(response);
                this.options.onComplete(annotationSet);
            }

            this.closeDialog();
        },

        error: function() {
            this.saving = false;
        },

        validateName : function(e) {
            this.errorsView.clear();
            this.model.set('name', $(e.currentTarget).val());
            var validationErrors = this.model.validate();
            if (validationErrors) {
                this.errorsView.showErrorsByKeys("Name", validationErrors);
                this.disableButton(this.submitButtonSelector);
            }
        }

    });

    return AnnotationSetView;
});