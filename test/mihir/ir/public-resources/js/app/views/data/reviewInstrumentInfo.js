/* global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'models/data/reviewVerificationRunModel',
    'hb!templates/data/review-instrument-info.html'
].concat('bootstrap'),
    function(
        $,
        _,
        Backbone,
        InstrumentInfo,
        template) {
	'use strict';

    var ReviewInstrumentInfoView = Backbone.View.extend({

        _template: template,
        
        initialize: function(options) {
        	this.model = new InstrumentInfo({
        		url: "getInstrumentInformation?resultId=" + options.resultId
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
        		self.$el.html(self._template(self.model.toJSON()));
        	});
            return this;            
        }
    });

    return ReviewInstrumentInfoView;
});
