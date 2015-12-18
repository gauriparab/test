/* global define:false*/
define([
    'jquery',
    'backbone',
    'collections/data/loadingMetrics',
    'hb!templates/data/loadingMetrics.html'
],
    function(
        $,
        Backbone,
        LoadingMetrics,
        template) {
	'use strict';

    var LoadingMetricsView = Backbone.View.extend({

        _template: template,

        initialize: function(options) {
            options = options || {};
            this.collection = new LoadingMetrics({
            	id: options.id
            });
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
        },

        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
        	var self = this;
        	this.collection.fetch({
        		success: function(){
                    self.$el.html(self._template({
                    	loadingMetrics: self.collection.toJSON()
                    }));
        		}
        	});
        }
	
    });

    return LoadingMetricsView;
});
