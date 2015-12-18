/* global define:false*/
define([
    'jquery',
    'backbone',
    'collections/data/filteringMetrics',
    'hb!templates/data/filteringMetrics.html'
],
    function(
        $,
        Backbone,
        FilteringMetrics,
        template) {
	'use strict';

    var FilteringMetricsView = Backbone.View.extend({

        _template: template,

        initialize: function(options) {
            options = options || {};
            this.collection = new FilteringMetrics({
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
        		success: function() {
        			self.$el.html(self._template({
            			filteringMetrics: self.collection.toJSON()
            		}));
        		}        		
        	})
        }
	
    });

    return FilteringMetricsView;
});
