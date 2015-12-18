/*global define:false*/
define([
    'underscore',
    'collections/BaseCollection',
    'models/variants/annotationClassification'
], function(
        _,
        BaseCollection,
        AnnotationClassification) {
    'use strict';

    var SELECT = 'select';

    var AnnotationClassifications = BaseCollection.extend({
        model: AnnotationClassification,

        initialize: function(models, options) {
            options = options || {};
            this._analyses = options.analyses;
            this._selected = options.selected || (models && this._prepareModel(models[0], options));
        },

        selectClassification: function(name) {
            this._selected = this.findWhere({name: name});
            this.trigger(SELECT, this._selected);
        },

        getSelected: function() {
            return this._selected;
        },

        toJSON: function() {
            var json = BaseCollection.prototype.toJSON.apply(this, arguments);
            json.selected = this._selected && this._selected.get('name');
            return json;
        }

    });

    return AnnotationClassifications;
});
