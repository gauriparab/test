/* global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'models/data/reviewVerificationRunModel',
    'hb!templates/data/review-analysis-info.html'
].concat('bootstrap'),
    function(
        $,
        _,
        Backbone,
        AnalysisInfo,
        template) {
	'use strict';

    var ReviewAnalysisInfoView = Backbone.View.extend({

        _template: template,
        
        initialize: function(options) {
        	this.model = new AnalysisInfo({
        		url: "getAnalysisInfo?resultId=" + options.resultId
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

    return ReviewAnalysisInfoView;
});
