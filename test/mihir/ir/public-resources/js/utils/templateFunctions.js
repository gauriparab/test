/*global define:false*/
define([ 'underscore' ],
    function(_) {
        'use strict';

        /**
         * Create a wrapper around a template function that binds the function
         * to a sub property of the calling context.
         *
         * @param field
         * @returns {Function}
         */
        Function.prototype.forField = function(field) {
            var template = this,
                parts = field.split('.');
            return function(ctx) {
                var local;
                _.each(parts, function(part) {
                    local = _.result(local || ctx, part);
                });
                return template(local);
            };
        };

        /**
         * Create a wrapper around a template function that binds the function
         * to a Backbone model as the context, populated from the original context.
         *
         * @param model
         * @returns {Function}
         */
        Function.prototype.forModel = function(model) {
            var template = this;
            return function(ctx) {
                return template(new model(ctx.toJSON()));
            };
        };

        /**
         * Create a wrapper around a template function that binds the function to
         * the result of calling toJSON() on the original context.
         *
         * @returns {Function}
         */
        Function.prototype.json = function() {
            var template = this;
            return function(ctx) {
                return template(_.result(ctx, 'toJSON'));
            };
        };

        /**
         * Create a wrapper around a template function that filters the calling context
         * through a supplied function.
         *
         * @param fn
         * @returns {Function}
         */
        Function.prototype.withFilter = function(fn) {
            var template = this;
            return function(ctx) {
                return template(fn.call(this, ctx));
            };
        };

        /**
         * Create a wrapper around a template function that adds extra data to
         * the template function call.
         *
         * @param data
         * @returns {Function}
         */
        Function.prototype.withData = function(data) {
            var template = this;
            return function(ctx) {
                return template(_.extend({}, ctx.toJSON(), data));
            };
        };

        return Function.prototype.forField;
    }
);
