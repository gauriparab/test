/*global define:false*/
define(['jquery', 'underscore', 'views/templateView', 'hb!templates/analysis/analysis-launch-confirm-name.html'],
    function($, _, TemplateView, template) {
        'use strict';

        var ConfirmView = TemplateView.extend({

            template: template,

            events: {
                'keyup input, textarea': 'fieldChanged'
            },

            initialize: function() {
                this.model.on('invalid', this.validationError, this);
            },

            render: function() {
                return TemplateView.prototype.render.apply(this, arguments);
            },

            fieldChanged: function(e) {
                var field = $(e.currentTarget);
                var name = field.val();
                this.model.set(field.attr('name'), name);
                if (!this.model.isValid() && _.contains(this.model.validationError, 'analysis.error.name')) {
                    this.$(field).parents(".control-group").addClass("error");
                } else {
                    this.$(field).parents(".control-group").removeClass("error");
                }
            },

            success: function() { //invoked by analysisLaunchConfirmView
                this.$(".errors ul").empty();
                this.$(".control-group").removeClass("error").addClass("success");
                this.$("img").show();
            },

            error: function(errors) { //TODO: Determine where this method is used / invoked. 
                this.$(".control-group").addClass("error");
                _.each(errors, function(error) {
                    this.$(".errors ul").append("<li>" + error + "</li>");
                });
            },

            validationError: function() {
                this.$('#launch-form-name').focus().select();
            }

        });

        return ConfirmView;

    }
);