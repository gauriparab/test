/* global define:false*/
define([
    'jquery',
    'backbone',
    'collections/data/histoGram',
    'hb!templates/data/histoGram.html'
],
    function(
        $,
        Backbone,
        HistoGram,
        template) {
	'use strict';

    var HistoGramView = Backbone.View.extend({

        _template: template,

        initialize: function(options) {
            options = options || {};
            
			this.collection = new HistoGram({ 
				id: options.id,
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
        				histoGram :self.collection.toJSON()
        			}));
        		}
        	});
        }
	
    });

    return HistoGramView;
});
