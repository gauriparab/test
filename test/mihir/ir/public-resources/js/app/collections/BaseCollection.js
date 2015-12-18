/*global define:false*/
define([ 'underscore', 'backbone', 'events/eventDispatcher' ], function(_, Backbone, dispatch) {
    "use strict";
    var BaseCollection = Backbone.Collection.extend({
        fetch: function(options) {
            return Backbone.Collection.prototype.fetch.call(this, _.extend(options || {}, {
                contentType: 'application/json'
            }));
        },

        getAllowed: function(workflowModel, successCallback) {
            return this.fetch({
                'data' : JSON.stringify(workflowModel.toSlimJSON()),
                'dataType' : "json",
                'type' : 'POST',
                'contentType' : 'application/json',
                'error' : this.handleError,
                'success' : successCallback,
                'reset' : true
            });
        },
        
        getFirstFactoryProvided : function() {
            return this.findWhere({factoryProvided:true});
        },

        handleError: function(model, response) {
            dispatch.trigger('error:validation', response);
        },

        removeById: function(id) {
            this.remove(this.get(id));
        }

    });

    return BaseCollection;
});