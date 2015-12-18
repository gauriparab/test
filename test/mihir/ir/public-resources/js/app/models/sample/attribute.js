/*global define:false*/
define([ 'underscore',
         'models/baseModel',
         'models/sample/controlledVocabulary' ],
    function (_,
              BaseModel,
              ControlledVocabulary) {
        'use strict';

        var EDIT_ACTION = 'EDIT';

        var Attribute = BaseModel.extend({

            defaults: {
                valueGarbled: false
            },

            validations: {
                name: function(attrs) {
                    return (!attrs.name || !/^[A-Za-z0-9_\-\. ]{1,256}$/.test(attrs.name)) && {
                        field: 'name',
                        msg: 'attribute.error.name.invalid'
                    };
                },

                type: function(attrs) {
                    return (attrs.type === undefined || attrs.type === null) && {
                        field: 'type',
                        msg: 'attribute.error.type.missing'
                    };
                },

                controlledVocabulary: function(attrs) {
                    var terms = attrs.controlledVocabulary && attrs.controlledVocabulary.get('terms');
                    return (attrs.type === 'LOV' && (terms === undefined || terms.length < 1)) && {
                        field: 'terms',
                        msg: 'attribute.error.terms.invalid'
                    };
                }
            },

            urlRoot: '/ir/secure/api/v40/attributes',

            constructor: function(attributes, options) {
                BaseModel.prototype.constructor.call(this, attributes, _.extend(options || {}, {
                    parse: true
                }));
            },

            fetch: function(options) {
                return BaseModel.prototype.fetch.call(this, _.extend(options || {}, {
                    contentType: 'application/json'
                }));
            },

            parse: function(response) {
                response.controlledVocabulary =
                    response.controlledVocabulary instanceof ControlledVocabulary &&
                        response.controlledVocabulary || new ControlledVocabulary(response.controlledVocabulary);
                return response;
            },

            clear: function() {
                BaseModel.prototype.clear.apply(this, arguments);
                this.attributes = this.parse({});
            },

            getPrimaryAction: function() {
                var actions = this.get('actions');
                if (_.contains(actions, EDIT_ACTION)) {
                    return EDIT_ACTION;
                } else {
                    return null;
                }
            }

        });

        Attribute.Name = {
            GENDER: 'Gender',
            TYPE: 'Sample Type',
            CANCER_TYPE: 'Cancer Type',
            PERCENT_CELLULARITY: 'Percentage Cellularity'
        };

        Attribute.Type = {
            DNA: 'DNA',
            RNA: 'RNA'
        };

        return Attribute;
    }
);

