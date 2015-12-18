/*global define:false*/
define([ 'jquery', 'backbone', 'hb!templates/error.html' ],
    function($, Backbone, template) {

        "use strict";

        var ValidationErrorsView = Backbone.View.extend({

            /*
             * Anticipated options:
             * container - the Selector or JQuery object to append the banner to
             * response - an response message for a 400 error that has json validation messages.
             */
            initialize: function(options) {
                this.options.container = options.container || $(".main .container-fluid:first");
            },

            render: function() {
                if (this.options.response.responseText) {
                    var responseJson = JSON.parse(this.options.response.responseText);
                    this.$el.html(template(responseJson)).prependTo($(this.options.container));
                }
                return this;
            },

            clearBanner: function() {
                this.$el.remove();
            }

        });

        ValidationErrorsView.show = function(response, container) {
            var view = new ValidationErrorsView({
                response: response,
                container: container
            });
            return view.render();
        };

        return ValidationErrorsView;

    });