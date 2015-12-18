/*global define:false*/
define([
    'jquery',
    'underscore',
    'models/baseModel',
    'collections/sample/specimenFiles',
    'collections/sample/specimenAttributes',
    'models/sample/specimenAttribute',
    'models/sample/attribute'
], function(
    $,
    _,
    BaseModel,
    SpecimenFiles,
    SpecimenAttributes,
    SpecimenAttribute,
    Attribute) {

    'use strict';
    
    var EDIT_SPECIMEN_ACTION = 'EDIT';

    var Specimen = BaseModel.extend({
        urlRoot: '/ir/secure/api/v40/samples',

        defaults: {
            attributeValueMap: {},
            attributes: []
        },

        /**
         * Field based validations
         *
         */
        validations: {
            // A sample must have a name set
            name: function(attrs) {
                return (!attrs.name || !/^[A-Za-z0-9_\-\. ]{1,256}$/.test(attrs.name)) && 'sample.error.name.invalid';
            },

            // A sample must have files of a single type
            files: function(attrs) {
                var type = null, error = null;
                if (attrs.files.models.length === 0) {
                    error = 'sample.error.files.empty';
                } else {
                    attrs.files.each(function(file) {
                        if (!type) {
                            type = file.get('_type');
                        } else {
                            if (file.get('_type') !== type) {
                                error = 'sample.error.files.mismatch';
                            }
                        }
                    });
                }
                return error;
            }
        },

        constructor: function(attributes, options) {
            BaseModel.call(this, attributes, _.extend(options || {}, {
                parse: true
            }));
        },

        parse: function(attributes) {
            attributes.files =
                attributes.files instanceof SpecimenFiles ? attributes.files
                                                          : new SpecimenFiles(attributes.files);
            attributes.attributes =
                attributes.attributes instanceof SpecimenAttributes ? attributes.attributes
                                                                    : new SpecimenAttributes(attributes.attributes);
            return attributes;
        },

        clone: function() {
            var attrs = _.clone(this.attributes);
            attrs.files = attrs.files.clone();
            return new this.constructor(attrs);
        },

        clear: function() {
            BaseModel.prototype.clear.call(this, {silent:true});
            this.set('files', new SpecimenFiles());
            this.trigger('change:name', this, this.attributes.name);
        },

        toSlimJSON: function() {
            var json = _.omit(
                _.clone(this.attributes),
                ['attributeValueMap', 'allowedActions', 'actions']
            );
            json.files = json.files.map(function(specimenFile) {
                return specimenFile.toSlimJSON();
            });
            json.attributes = json.attributes.map(function(specimenAttribute) {
                return specimenAttribute.toSlimJSON();
            });
            return json;
        },

        addFiles: function(specimenFiles) {
            this.attributes.files.add(specimenFiles.models);
            this.trigger('change:files');
            this.trigger('change');
        },

        removeFiles: function(specimenFiles) {
            this.attributes.files.remove(specimenFiles.models);
            this.trigger('change:files');
            this.trigger('change');
        },

        updateAttributes: function(specimenAttrs) {
            var self = this;
            _.each(specimenAttrs, function(specimenAttr) {
                var child = self.get('attributes').find(function(attr) {
                    return attr.get('attribute').id === specimenAttr.attribute.id;
                });
                if (child) {
                    child.set({value: specimenAttr.value});
                } else {
                    self.get('attributes').add(new SpecimenAttribute(specimenAttr));
                }
            });
        },
        
        getPrimaryAction: function() {
            var allActions = this.get('actions');
            if (_.contains(allActions, EDIT_SPECIMEN_ACTION)) {
                return EDIT_SPECIMEN_ACTION;
            } else {
                return null;
            }
        },

        _getAttributeValue: function(name) {
            var attr = this.get('attributes').find(function(specimenAttr) {
                return specimenAttr.get('attribute').get('name') === name;
            });
            return attr && attr.get('value') || undefined;
        }

    });

    // map methods for looking up standard attributes
    _.each(Attribute.Name, function(label, name) {
        var methodName = name.toLowerCase().replace(/_(\w)/g, function(g) { return g[1].toUpperCase(); });
        Specimen.prototype[methodName] = function() {
            return this._getAttributeValue(Attribute.Name[name]);
        };
    });

    return Specimen;
});