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
        TemplatePrep,
        template) {
	'use strict';

    var ReviewTemplatePrepView = Backbone.View.extend({

        _template: template,
        
        initialize: function(options) {
        	this.model = new TemplatePrep({
        		url: "getTemplatePreparationInfo?resultId=" + options.resultId
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

    return ReviewTemplatePrepView;
});
