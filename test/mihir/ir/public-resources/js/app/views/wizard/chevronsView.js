/*global define:false*/
define(['jquery',
        'underscore',
        'backbone',
        'views/chevron'],
    function($,
             _,
             Backbone,
             ChevronView) {

    'use strict';

    var ChevronsView = Backbone.View.extend({

        tagName: 'ul',

        initialize: function() {
            this.currentStep = this.options.currentStep;
            this.parentView = this.options.parentView;
            this.updateExistingEntity = this.options.updateExistingEntity;
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
            this.collection.on('reset', _.bind(this.render, this));
            this.parentView.on('change:wizardStep', this._onWizardStepChanged, this);
        },

        undelegateEvents: function() {
            this.parentView.off('change:wizardStep', this._onWizardStepChanged, this);
            this.collection.off('reset');
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
            var chevronViews = [];

            this.collection.each(function(chevron) {
                chevronViews.push(new ChevronView({
                    tagName: 'li',
                    model: chevron
                }));
            });

            // Clear out this element.
            this.$el.empty();

            var afterCurrent = false;
            var disableAfterCurrent = (this.parentView.model && !this.parentView.model.isValid()) || !this.updateExistingEntity;

            var subEl;
            // Render each sub-view and append it to the parent view's element.
            _.each(chevronViews, function(cv) {
                subEl = cv.render().$el;

                this.$el.append(subEl);

                if (afterCurrent && disableAfterCurrent) {
                    subEl.addClass('disabled');
                }

                if (this.currentStep === cv.model.get('identifier')) {
                    subEl.addClass('active');
                    afterCurrent = true;
                }
		
		if (cv.model.get('disabled')){
		    subEl.removeClass('active');
		    subEl.addClass('disabled');
		}

                $('li', this.el).width(100 / this.collection.length + '%');
            }, this);

            return this;
        },

        _onWizardStepChanged: function(currentStep) {
            this.currentStep = currentStep;
            this.render();
        }

    });


    return ChevronsView;
});
