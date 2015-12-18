/*global define:false*/
define(['underscore', 'backbone', 'collections/annotationSourceCollection', 'models/common/nameValidation'],
        function (_, Backbone, AnnotationSourceCollection, NameValidation) {

    "use strict";

    var EDIT_ACTION = 'EDIT';

    var AnnotationSet = Backbone.Model.extend({
        urlRoot: '/ir/secure/api/annotationSourceSet/create',

        constructor: function(attributes, options) {
            Backbone.Model.call(this, attributes, _.extend(options || {}, {
                parse: true
            }));
        },

        sourceIsAllowed: function(source) {
            var thisSources = this.get('sources');
            // if sources are empty we can add any source.
            if (!thisSources) {
                return true;
            }
            if (thisSources.get(source)) {
                return false;
            }

            // if multiple are not allowed, check for an existing source with that type...
            var allowMultipleOfType = source.get("type").get("multipleAllowedPerAnnotationSet");
            if (!allowMultipleOfType && thisSources && thisSources.findWhere({type: source.get("type")})) {
                return false;
            }

            return true;
        },

        validations: {
            nameShort: function(attrs) {
                return NameValidation.tooShort(attrs.name);
            },

            nameLong: function(attrs) {
                return NameValidation.tooLong(attrs.name);
            },

            nameContent: function(attrs) {
                return NameValidation.badChar(attrs.name);
            }
        },

        validate: function(attrs, options) {
            var errors = [];

            options = options || {};
            attrs = attrs || this.attributes;

            var validations = options.include && _.pick(this.validations, options.include) || this.validations;

            _.each(validations, function(func) {
                var error = func.call(this, attrs);
                if (error) {
                    errors.push(error);
                }
            }, this);

            return errors.length !== 0 && errors;
        },

        fetch: function(options) {
            return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
                contentType: 'application/json'
            }));
        },

        parse: function(response) {
            if (response) {
                response.sources = response.sources instanceof AnnotationSourceCollection &&
                    response.sources || new AnnotationSourceCollection(response.sources);
            }
            return response;
        },
        
        getPrimaryAction: function() {
            var allActions = this.get('actions');
            if (_.contains(allActions, EDIT_ACTION)) {
                return EDIT_ACTION;
            } else {
                return null;
            }
        },

        toJSON: function() {
            return _.extend(_.clone(this.attributes), {
                sources: this.attributes.sources.toJSON()
            });
        }
    });

    return AnnotationSet;
});