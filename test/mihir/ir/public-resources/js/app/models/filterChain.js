/*global define:false*/
define(['underscore', 'backbone', 'collections/filterCollection', 'models/common/nameValidation'],
    function (_, Backbone, FilterCollection, NameValidation) {

    "use strict";

    var EDIT_ACTION = 'EDIT';

    var FilterChain = Backbone.Model.extend({

        urlRoot: '/ir/secure/api/filterChain',

        constructor: function(attrs, options) {
            Backbone.Model.call(this, attrs, _.extend(options || {}, {
                parse: true
            }));
        },

        fetch: function(options) {
            return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
                contentType: 'application/json'
            }));
        },
        
        sync: function(method, model, options) {
		    if (model.methodUrl && model.methodUrl[method.toLowerCase()]) {
	      		options = options || {};
	      		options.url = model.methodUrl[method.toLowerCase()];
	     	}
		    Backbone.sync(method, model, options);
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
        
        methodUrl: {
    	    'create': '/ir/secure/api/filterChain/create'
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

        getFilters: function() {
            var filters = this.get('filters');
            if (filters) {
                return filters instanceof Backbone.Collection ? filters : new FilterCollection(filters);
            } else {
                return new FilterCollection();
            }
        },

        getPrimaryAction: function() {
            var allActions = this.get('actions');
            if (_.contains(allActions, EDIT_ACTION)) {
                return EDIT_ACTION;
            } else {
                return null;
            }
        },

        parse: function(resp) {
            if (_.isArray(resp.filters) && !(resp.filters instanceof FilterCollection)) {
                resp.filters = new FilterCollection(resp.filters, {parse: true});
            }
            return resp;
        }

    });

    return FilterChain;
});
