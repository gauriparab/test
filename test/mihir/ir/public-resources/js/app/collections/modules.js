/*global define:false*/
define(['underscore', 'collections/BaseCollection', 'models/module' ], 
    function(_, BaseCollection, Module) {
    "use strict";
    var Modules = BaseCollection.extend({
        model : Module,
        url : function() {
        	if(undefined != this.assayId){
        		return this.baseUrl + '/modules/id?id='+this.assayId;
        	}else{
        		return this.baseUrl + '/modules?workflowId='+this.workflowId+'&vtype='+this.varientType+'&level='+this.varientLevel;
        	} 
        },
        
        initialize: function(options) {
            this._dataLoaded = false;
            this.baseUrl = _.result(options, 'baseUrl') || '/ir/secure/api/v40/workflows';
            this.assayId = options.assayId;
            this.workflowId = options.workflowId;
            this.varientType = options.varientType;
            this.varientLevel = options.varientLevel;
        },

        getAllowed: function () {
            var argArray = Array.prototype.slice.call(arguments);
            var originalCb = argArray[1];
            var self = this;
            argArray[1] = function () {
                self._dataLoaded = true;
                if (_.isFunction(originalCb)) {
                    originalCb.apply(this, Array.prototype.slice.call(arguments));
                }
            };
            return BaseCollection.prototype.getAllowed.apply(this, argArray);
        },

        isDataLoaded: function () {
            return this._dataLoaded;
        }
    });

    return Modules;
});