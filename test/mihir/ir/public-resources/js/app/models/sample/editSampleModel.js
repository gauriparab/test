/*global define:false*/
define([ 'backbone', 'jquery', 'underscore' ], function(Backbone, $, _) {

    'use strict';

    var EditSampleModel = Backbone.Model.extend({

        urlRoot : '/ir/secure/api/samplemanagement/samples',

        defaults : {
            visibilityPreference : "DEFAULT",
            state : "PENDING"
        },
        fetch : function(options) {
            return Backbone.Model.prototype.fetch.call(this, _.extend(options || {}, {
                contentType : 'application/json'
            }));
        },
        
        
        _validateString : function(string) {
            return _.isUndefined(string) || _.isEmpty(string.trim());
        },

        url : function(){
            return this.urlRoot + "/editSample";
        }

    });

    return EditSampleModel;
});
