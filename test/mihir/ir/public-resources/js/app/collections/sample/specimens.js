/*global define:false*/
define(['underscore', 'backbone', 'collections/BaseCollection', 'models/specimen'],
    function(_, Backbone, BaseCollection, Specimen) {
        'use strict';

        var SpecimenCollection = BaseCollection.extend({
            url: '/ir/secure/api/v40/samples',

            model: Specimen,

            validations: Specimen.prototype.validations,

            isValid: function(options) {
                if (_.size(this) === 0) {
                    return false;
                }
                return this.every(function(sample) {
                    return sample.isValid(options);
                });
            },

            save: function(options) {
                return Backbone.ajax({
                    url: this.url + '/batch',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(this.toSlimJSON()),
                    success: function(resp) {
                        if (_.isObject(resp)) {
                            if (_.isFunction(options.success)) {
                                options.success(resp.results);
                            }
                        }
                    }
                });
            },
            
            process: function(batchSpecimenFile, onSuccess) {
                return Backbone.ajax({
                    url: '/ir/secure/api/v40/batch_samples/process/' + batchSpecimenFile.get('id'),
                    type: 'POST',
                    contentType: 'application/text',
                    success: _.bind(function(samples) {
                        this.reset(samples);
                        this.trigger('change');
                        if (_.isFunction(onSuccess)) {
                            onSuccess(samples);
                        }
                    }, this)
                });
            },

            toSlimJSON: function(options) {
                return this.map(function(model){ return model.toSlimJSON(options); });
            }

        });

        return SpecimenCollection;
    });
