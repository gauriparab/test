/* global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'models/monitor/instrument',
    'hb!templates/monitor/run-ot-view.html'
],
    function(
        $,
        _,
        Backbone,
        Instrument,
        template) {

	'use strict';

    var OTView = Backbone.View.extend({

        _template: template,

        initialize: function(options) {
            this.model = new Instrument(options.data);
            this.showOT=options.showOT;
        },
        
        events:{
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
        },

        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
            this.$el.html(this._template({
            	otDto: this.model.toJSON(),
            	showOT: this.showOT
            }));
        }
	
    });

    return OTView;
});
