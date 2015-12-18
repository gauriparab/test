/*global define:false*/
define(['underscore', 'backbone', 'models/baseModel'], function(_, Backbone, BaseModel) {
    'use strict';

    var IRSystemServiceModel = BaseModel.extend({

        urlRoot : "/ir/secure/api/v40/irServices",

        invokeServiceAction: function(action, options) {
            options = _.extend(options || {}, {
                url : this.urlRoot + '/' + this.id + '/' + action.toLowerCase(),
                contentType : "application/json;charset=UTF-8"
            });
            return Backbone.sync('update', this, options);
        }
    });

    return IRSystemServiceModel;
});
