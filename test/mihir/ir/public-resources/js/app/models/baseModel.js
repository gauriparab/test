/*global define:false*/
define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
    'use strict';

    /**
     * Some base functionality for our Backbone models
     *
     * @type {*}
     */
    var BaseModel = Backbone.Model.extend({

        validations: {
            // field validation rules may go here
        },

        /**
         * Validation callback
         *
         * @param attrs
         * @param options
         * @returns {boolean|Array}
         */
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

        /**
         * During synchronization of a create or update, use toSlimJSON if available
         *
         * @param method
         * @param model
         * @param options
         * @returns {*}
         */
        sync: function(method, model, options) {
            if (method === 'create' || method === 'update') {
                options.contentType = 'application/json';
                options.data = _.isFunction(model.toSlimJSON) && JSON.stringify(model.toSlimJSON()) || 
                    _.isFunction(model.toJSON) && JSON.stringify(model.toJSON()) ||
                    JSON.stringify(model);
            }
            return Backbone.sync(method, model, options);
        },

        /**
         * Default to JSON as content type unless otherwise specified.
         *
         * @param options
         */
        fetch: function(options) {
            return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
                contentType: 'application/json'
            }));
        },

        /**
         * Ordinary JSON serialization
         *
         * @returns {*}
         */
        toJSON: function(options) {
            options = options || {};
            var json = _.omit(_.clone(this.attributes), options.excludes);

            //useful to refer back to models that have not been persisted.
            json.cid = this.cid;

            _.each(json, function(value, key) {
                if (value) {
                    if (value instanceof Backbone.Model ||
                        value instanceof Backbone.Collection) {
                        json[key] = value.toJSON();
                    } else if (_.isArray(value)) {
                        json[key] = _.map(value, function(item) {
                            if (item instanceof Backbone.Model) {
                                return item.toJSON();
                            } else {
                                return item;
                            }
                        });
                    }
                }
            });

            return json;
        },

        /**
         * Default implementation for toSlimJSON() to provide an implementation for extensions that
         * do not need any other functionality. This sends the full toJSON Representation of this object
         * but generally this should minimize the objects in the JSON to only include ID references for
         * linked objects.
         *
         * @param options
         * @returns {*}
         */
        toSlimJSON: function(options) {
            return this.toJSON(options);
        },

        getSub: function(propString) {
            var properties = propString.split('.');

            return getProperty(this, properties.shift());
            
            function getProperty(object, property) {
                var subObject;
                
                if (object instanceof Backbone.Model) {
                    subObject = object.get(property);
                } else {
                    subObject = _.result(object, property);
                }

                if (properties.length && subObject) {
                    return getProperty(subObject, properties.shift());
                } else {
                    return subObject || null;
                }
            }

        }

    });

    return BaseModel;

});
