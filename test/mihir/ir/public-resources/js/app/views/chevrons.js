/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'data/workflow', 'events/eventDispatcher', 'views/chevron'], 
        function($, _, Backbone, enums, dispatcher, SubView) {
    "use strict";
    var ChevronsView = Backbone.View.extend({

        tagName: "ul",

        initialize: function() {
            this._currentApplicationType = this.options.currentApplicationType;
            dispatcher.on('change:applicationType', this.applicationTypeChanged, this);
            dispatcher.on('change:specimenGroup', this.specimenGroupChanged, this);
            dispatcher.on('change:wizardStep', this.wizardStepChanged, this);
            this.listenTo(this.collection, 'reset', this.render);
            this.currentStep = this.options.currentStep;

        },

        render: function() {
            var that = this;
            var chevronViews = [];

            this.collection.each(function(chevron) {
                chevronViews.push(new SubView({
                    tagName: "li",
                    model: chevron
                }));
            });


            // Clear out this element.
            $(this.el).empty();
            var afterCurrent = false;

            var subEl;
            // Render each sub-view and append it to the parent view's element.
            _(chevronViews).each(function(cv) {
                subEl = cv.render().$el;
                $(that.el).append(subEl);

                if (afterCurrent) {
                    subEl.addClass('disabled');
                }

                if (that.currentStep === cv.model.get("identifier")) {
                    subEl.addClass("active");
                    afterCurrent = true;
                }
                $("li", that.el).width(100 / that.collection.length + "%");
            });

            return this;
        },

        applicationTypeChanged: function(applicationType) {
            this._currentApplicationType = applicationType.get('identifier');
            this.collection.reset(enums.Tabs.getTabsForType(this._currentApplicationType));
        },

        specimenGroupChanged: function(specimenGroupType) {
            this.collection.reset(enums.Tabs.getTabsForType(this._currentApplicationType,
                specimenGroupType.get('identifier')));
        },

        wizardStepChanged: function(theCurrentStep) {
            this.currentStep = theCurrentStep;
            this.render();
        }

    });


    return ChevronsView;
});