/*global define:false*/
define([ 'jquery', 'backbone', 'underscore', 'events/eventDispatcher', 'hb!templates/error.html' ],
        function($, Backbone, _, dispatcher, template) {
    "use strict";
    var ErrorsView = Backbone.View.extend({
        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
            this.model.on('error', this.showError, this);
        },

        updateFormErrors: function(formView, errors) {
            if (errors && errors.allErrors) {
                _.each(errors.allErrors, function(e) {
                    // TODO some code uses e.code here
                    formView.$('.control-group')
                    .has('input[id=' + e.field + ']')
                    .addClass('error');
                });
            }
        },

        clearFormErrors: function(formView) {
            formView.$('.control-group').removeClass('error');
        },

        undelegateEvents: function() {
            this.model.off('error', this.showError, this);
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        showError : function(model, error, settings) {
            // non-400 errors should be handled globally in ir.js, the check for noGlobalErrorHandler is to
            // ensure that legacy code does not swallow these.
            var ajaxSettings = settings || {};
            if (ajaxSettings.noGlobalErrorHandler === true || error.status === 400 &&
                this.options.showErrors !== false) {
                this.$el.html(template(JSON.parse(error.responseText)));
            }
        },

        showErrorsByKeys : function(title, errorKeys) {
            if (this.options.showErrors !== false) {
                var errorObject = {message: title, errors: {allErrors: []}};
                _.each(errorKeys, function(errorKey) {
                    errorObject.errors.allErrors.push({defaultMessage: errorKey});
                }, this);

                this.$el.html(template(errorObject));
            }
        },

        clear: function() {
            this.$el.empty();
        }
    });
    return ErrorsView;
});