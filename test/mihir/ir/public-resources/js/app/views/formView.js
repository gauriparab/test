/*global define:false*/
define(['underscore', 'jquery', 'views/templateView', 'hb!templates/common/spinner.html'], 
    function(_, $, TemplateView, Spinner) {

    'use strict';

    var FormView = TemplateView.extend({

        /** jquery selector that will return the save button */
        submitButtonSelector: '',

        /** Object, or function that returns an object, to be passed to the model on save */
        saveData: {},
        
        /** Options object|function that will be passed to the model on save. */
        saveOptions: {},
        
        delegateEvents: function() {
            TemplateView.prototype.delegateEvents.apply(this, arguments);
            if (this.submitButtonSelector) {
                this.$el.on('click', this.submitButtonSelector, _.bind(this.onSave, this));
            }
            if (this.model) {
                this.listenTo(this.model, 'error', this.onSaveError);
                this.listenTo(this.model, 'invalid', function() {
                    this.enableButton(this.submitButtonSelector);
                });
            }
        },
        
        undelegateEvents: function() {
            if (this.submitButtonSelector) {
                this.$el.off('click', this.submitButtonSelector);
            }
            if (this.model) {
                this.stopListening(this.model);
            }
            TemplateView.prototype.undelegateEvents.apply(this, arguments);
        },
        
        /**
         * Enable the button that matches the given jquery selector.
         */
        enableButton: function(selector) {
            this.$(selector)
                .removeClass('disabled')
                .prop('disabled', false)
                .removeAttr('title');
            this.$(selector + ' + .icon-loader').remove();
        },

        /**
         * Disable the button that matches the given selector.
         * If the button is already disabled then return false.
         * @param options: 
         *          showSpinner - show an ajax spinner next to the button. Default to false 
         *          message - a message indicating why the button is disabled
         * @return true if the button was disabled, false if it was already disabled
         */
        disableButton: function(selector, options) {
            var opts = options || {},
                showSpinner = opts.showSpinner === true,
                element = _.isString(selector) ? this.$(selector) : selector;
            if (element.hasClass('disabled')) {
                return false;
            }
            element.addClass('disabled').prop('disabled', true);
            if (showSpinner) {
                element.after(Spinner());
            }
            if (opts.message) {
                element.attr('title', opts.message);
            }
            return true;
        },
        
        /**
         * Save button click handler.
         */
        onSave: function(e) {
            e.preventDefault();
            var buttonWasDisabled = this.disableButton(this.submitButtonSelector, { showSpinner: true });
            if (buttonWasDisabled) {
                if (this.errorsView) {
                    this.errorsView.clear();
                }
                this.save();
            }
        },

        /**
         * Default save implementation. 
         */
        save: function() {
            this.model.save(
                // extension point for subclasses to provide data
                _.result(this, 'saveData'), 
                _.extend(
                    // default options
                    { success: _.bind(this.onSaveSuccess, this) }, 
                    // extension point for subclasses to provide options
                    _.result(this, 'saveOptions')));
        },
        
        
        onSaveSuccess: function() {
            // when using the default save function, override this method w/ an onSaveSuccess handler
        },
        
        /**
         * Default error handler.
         */
        onSaveError: function(model, response) {
            this.enableButton(this.submitButtonSelector);
            if (this.errorsView) {
                var error = JSON.parse(response.responseText);
                this.errorsView.updateFormErrors(this, error.errors);
                this.errorsView.showError(model, response);
            }
        }

    });

    return FormView;
});
