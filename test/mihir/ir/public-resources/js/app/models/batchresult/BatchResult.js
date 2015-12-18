/* global define:false */
define(['underscore',
        'backbone',
        'models/baseModel',
        'collections/BaseCollection'],
    function(_, Backbone, BaseModel, BaseCollection) {

        'use strict';

        var Error = BaseModel.extend({
            isSingle: function() {
                return this.get('_type') === '.BatchResult$SingleError';
            },

            isMulti: function() {
                return this.get('_type') === '.BatchResult$Errors';
            },

            isLineBased: function() {
                return this.get('_type') === '.BatchResult$LineBasedError';
            },

            getMessage: function() {
                switch (true) {
                case this.isSingle():
                    return this.get('message');
                case this.isMulti():
                    return this.get('messages');
                case this.isLineBased():
                    return this.get('lineErrors');
                }
            }
        });

        var ItemResult = BaseModel.extend({
            constructor: function(attrs, options) {
                options = options || {};
                this._itemModel = options.itemModel;
                BaseModel.call(this, attrs, _.extend(options, {
                    parse: true
                }));
            },

            parse: function(response) {
                response.item = (!_.isUndefined(this._itemModel) && !(response.item instanceof this._itemModel)) ?
                    new this._itemModel(response.item) : response.item;
                response.error = (response._type === 'FAIL' && !(response.error instanceof Error)) ?
                    new Error(response.error) : undefined;
                return response;
            },

            isSuccess: function() {
                return this.get('_type') === 'SUCCESS';
            },

            isFail: function() {
                return this.get('_type') === 'FAIL';
            },

            hasError: function() {
                return this.isFail() && this.has('error');
            }
        });

        var ItemResults = BaseCollection.extend({

            model: ItemResult,

            getSuccessfulResults: function() {
                return new Backbone.Collection(this.filter(function(itemResult) {
                    return itemResult.isSuccess();
                }));
            },

            getFailedResults: function() {
                return new Backbone.Collection(this.filter(function(itemResult) {
                    return itemResult.isFail();
                }));
            }

        });

        var BatchResult = BaseModel.extend({
            constructor: function(attrs, options) {
                options = options || {};
                this._itemModel = options.itemModel;
                BaseModel.call(this, attrs, _.extend(options, {
                    parse: true
                }));
            },

            parse: function(response) {
                response.results = response.results instanceof ItemResults ?
                    response.results : new ItemResults(response.results, {
                        itemModel: this._itemModel
                    });
                return response;
            },

            getSuccessfulResults: function() {
                return this.get('results').getSuccessfulResults();
            },

            getFailedResults: function() {
                return this.get('results').getFailedResults();
            },

            getErrors: function() {
                return this.getFailedResults().pluck('error');
            },

            getErrorMessages: function() {
                return _.map(this.getErrors(), function(error) {
                    return error.getMessage();
                });
            }
        });

        BatchResult.ItemResult = ItemResult;
        BatchResult.Error = Error;

        return BatchResult;
    }
);