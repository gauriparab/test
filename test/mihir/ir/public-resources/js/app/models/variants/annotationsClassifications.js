/*global define:false*/
define(['underscore', 'models/baseModel'], function(_, BaseModel) {
    'use strict';
    
    var AnnotationsClassifications = BaseModel.extend({

        defaults: function() {
            return {
                annotationsClassifications: []
            };
        },

        initialize: function() {
            var selectedClassification,
                annotationsClassifications;
            this.attributes = this.parse(this.attributes);
            selectedClassification = this.getSelectedClassification();
            annotationsClassifications = this.getAnnotationsClassifications();
            if (annotationsClassifications && !selectedClassification) {
                this.set('selectedClassification', annotationsClassifications[0] || null);
            }
        },

        getAnnotationsClassifications: function() {
            return this.get('annotationsClassifications');
        },
        
        getSelectedClassification: function() {
            return this.get('selectedClassification');
        },
        
        selectClassification: function(classification) {
            this.set('selectedClassification', 
                    _.findWhere(this.getAnnotationsClassifications(), {classification : classification}));
        },
        
        isAnnotationAttributeHidden: function(attrKey) {
            var selectedAnnotationAttributes = this.getSelectedClassification().annotationAttributes;
            return _.find(selectedAnnotationAttributes, function(annotationAttribute) {
                return attrKey && attrKey.keyName === annotationAttribute.keyName;
            }) === undefined;
        }

    });
    
    return AnnotationsClassifications;
});
