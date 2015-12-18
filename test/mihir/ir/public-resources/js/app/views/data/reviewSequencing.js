/* global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'models/data/reviewVerificationRunModel',
    'hb!templates/data/review-template-prep.html'
].concat('bootstrap'),
    function(
        $,
        _,
        Backbone,
        Sequencing,
        template) {
	'use strict';

    var ReviewSequencingView = Backbone.View.extend({

        _template: template,
        
        initialize: function(options) {
        	this.model = new Sequencing({
        		url: "getSequencingInfo?resultId=" + options.resultId
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
        	$.when(this.model.fetch()).done(function(){
        		self.model.set("isSequencing", true);
        		self.$el.html(self._template(self.model.toJSON()));
        	});
            return this;
        }
    });

    return ReviewSequencingView;
});
