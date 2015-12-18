/* global define:false*/
define([
    'jquery',
    'backbone',
    'collections/data/signOffDetails',
    'hb!templates/data/signOffDetails.html'
],
    function(
        $,
        Backbone,
        SignOffDetails,
        template) {
	'use strict';

    var SignOffDetailsView = Backbone.View.extend({

        _template: template,

        initialize: function(options) {
            options = options || {};
            
			this.collection = new SignOffDetails({ 
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
        				signOffDetails :self.collection.toJSON()
        			}));
        		}
        	});
        }
	
    });

    return SignOffDetailsView;
});
