/* global define:false*/
define([
    'jquery',
    'backbone',
    'collections/data/summary',
    'hb!templates/data/summary.html'
],
    function(
        $,
        Backbone,
        Summary,
        template) {
	'use strict';

    var RunQcView = Backbone.View.extend({

        _template: template,

        initialize: function(options) {
            options = options || {};
            
			this.collection = new Summary({ 
				id: options.id,
				type: options.type
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
                    	summary: self.collection.toJSON(),
                    	type: self.options.type
                    }));
        		}
        	});
        }
	
    });

    return RunQcView;
});
