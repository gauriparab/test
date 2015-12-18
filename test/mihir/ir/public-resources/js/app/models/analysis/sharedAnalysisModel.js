/*global define:false*/
define(['underscore', 'models/sharing/sharedWithModel' ],
    function (_, SharedWithModel) {
        'use strict';

        var SharedAnalysisModel = SharedWithModel.extend({

            url: '/ir/secure/api/v40/analysis/',

            initialize: function (attributes, options) {
                options = options || {};
                this._sharedEntity = options.sharedEntity;
            },

            setEmail: function(email) {
                this.set('email', email);
            },
            
            setSharedEntity: function(sharedEntity) {
                this._sharedEntity = sharedEntity;
            },

            parse: function (response, options) {
                if (options.extractSharedWithOnly) {
                    return response.sharedWith;
                } else {
                    return response;
                }
            },

            save: function (attributes, options) {
                options = _.extend(options || {}, {
                    url: this.url + this._sharedEntity.id + '/share',
                    extractSharedWithOnly: true,
                    contentType: "application/json",
                    dataType: "json"
                });
                return SharedWithModel.prototype.save.call(this, attributes, options);
            },

            destroy: function (options) {
                options = _.extend(options || {}, {
                    url: this.url + this._sharedEntity.id + '/share',
                    data: JSON.stringify(this.toJSON()),
                    contentType: "application/json",
                    dataType: "json"
                });
                return SharedWithModel.prototype.destroy.call(this, options);
            }

        });

        return SharedAnalysisModel;
    });