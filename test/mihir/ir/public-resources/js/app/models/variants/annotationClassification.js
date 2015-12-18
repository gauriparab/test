/*global define:false*/
define([
    'jquery',
    'underscore',
    'models/baseModel'
], function($, _, BaseModel) {
    'use strict';

    var AnnotationClassification = BaseModel.extend({

        initialize: function(attrs, options) {
            options = options || {};
            this._analyses = options.analyses;
        },

        getAnnotationKeys: function(done) {
            var annotationKeys = this.get('annotationKeys');
            return _.isUndefined(annotationKeys) ?
                this._fetchAnnotationKeys().done(done) : $.Deferred().done(done).resolve(annotationKeys);
        },

        _fetchAnnotationKeys: function() {
            var self = this;
            return $.ajax({
                url: this._getUrl()
            }).done(function(data) {
                self.set('annotationKeys', data);
            });
        },

        _getUrl: function() {
            if (_.size(this._analyses) === 1 && this.get('name')) {
                return '/ir/secure/api/v40/analysis/' + this._analyses.getIds()[0] + '/annotationKeys/' + this.get('name');
            } else {
                return '/ir/secure/api/v40/analyses/annotationKeys?analysisIds=' + this._analyses.getIds().join();
            }
        }
    });

    return AnnotationClassification;
});
