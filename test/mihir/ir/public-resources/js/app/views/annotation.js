/*global define:false*/
define(['underscore', 'jquery', 'views/ParentView', 'views/annotationSets', 'views/annotationSettingsView', 'views/common/bannersView', 
    'collections/annotationSets', 'hb!templates/assay-annotation.html', "modules/annotationSetModule"],
function(_, $, ParentView, AnnotationSetsCollectionView, AnnotationSettingsView, BannerView, AnnotationSetsCollection, 
         template, annotationSetModule) {
	"use strict";
	var WorkflowView = ParentView.extend({
		initialize: function() {

			this.annotationSets = new AnnotationSetsCollection();

			this.annotationSetsView = new AnnotationSetsCollectionView({
				model: this.model,
				collection: this.annotationSets
			});

			this.settingsView = new AnnotationSettingsView({
				model : this.model
			});
		},
        
        events : {
            'click #addAnnotationSet' : 'launchDialog'
        },
        
		render : function() {
            this.$el.html(template);
            if (this.annotationSets.length > 0) {
                this._onGetAllowedSuccess();
            } else {
                this.annotationSets.getAllowed(this.model, _.bind(this._onGetAllowedSuccess, this));
            }

            return this;
        },

		_onGetAllowedSuccess : function() {
            if (!this.model.getAnnotationSet()) {
                // Set the selected to the first Ion Default annotation set in
                // the list of available annotation sets;
                this.model.setAnnotationSet(this.annotationSets.getFirstFactoryProvided());
            }
            this.renderSubView(this.annotationSetsView, "#annotationSelectDiv");
            this.renderSubView(this.settingsView, "#settings-detail");

            this.$("[data-toggle='tooltip']").tooltip();
            return this;
        },

        launchDialog : function() {
            annotationSetModule.initialize({
                modalSelector: "#dialog",
                action : "CREATE",
                onComplete: this.getCompletePresetModalFunc("workflow.annotation.set.successful.creation")
            });
        },

        getCompletePresetModalFunc: function(messageKey) {
            var me = this;
            return function(addedAnnotationSet) {
                new BannerView({
                    container: $(".main-content>.container-fluid"),
                    style: "success",
                    titleKey: messageKey
                }).render();
                
                me.model.setAnnotationSet(addedAnnotationSet);
                me.annotationSets.getAllowed(me.model);
            };
        }

	});

	return WorkflowView;
});