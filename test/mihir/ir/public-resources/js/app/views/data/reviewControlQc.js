/* global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'collections/data/reviewControlQcs',
    'hb!templates/data/review-control-qc.html'
].concat('bootstrap'),
    function(
        $,
        _,
        Backbone,
        ControlQcList,
        template) {
	'use strict';

    var ReviewControlQcView = Backbone.View.extend({

        _template: template,
        
        initialize: function(options) {
        	this.collection = new ControlQcList({
        		resultId: options.resultId
        	});
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
        },

        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },
        
        events: {
        },

        render: function() {
        	var self = this;
        	$.when(this.collection.fetch()).done(function(){
        		self.$el.html(self._template({
        			controlQcs : self.collection.toJSON()
        		}));
        	});
            return this;
        }
    });

    return ReviewControlQcView;
});
