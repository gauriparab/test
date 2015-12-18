/*global define:false*/
define(['jquery', 'underscore', 'models/baseModel', 'models/sharing/sharedWithModel' ],
    function ($, _, BaseModel, SharedWithModel) {
        'use strict';

        var SharedAnalysesModel = BaseModel.extend({

            initialize: function (attributes, options) {
                options = options || {};
                this._sharedWith = new SharedWithModel();
                this._sharedEntity = options.sharedEntity;
            },

            setEmail: function(email) {
                this._sharedWith.set('email', email);
            },
            
            validate: function(attrs, options) {
                return BaseModel.prototype.validate.apply(this, arguments) || this._sharedWith.validate(null, options);
            },

            shareWith: function (opts) {
                var options = _.extend(opts || {}, {
                    url: '/ir/secure/api/v40/batch_analysis/share',
                    type: 'POST',
                    data : JSON.stringify(this._createShareWithRequest()),
                    contentType: "application/json",
                    dataType: "json"
                });
                $.ajax(options);
            },

            _createShareWithRequest: function() {
                return {
                    sharedEntity: this._sharedEntity.toJSON(),
                    sharedWith: this._sharedWith.toJSON()
                };
            }

        });

        return SharedAnalysesModel;
    });