/* global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'views/common/bannersView',
    'collections/monitor/instruments',
    'hb!templates/monitor/instrument-view.html'
],
    function(
        $,
        _,
        Backbone,
        BannerView,
        Instruments,
        template) {

	'use strict';

    var InstrumentView = Backbone.View.extend({

        _template: template,

        initialize: function(options) {
	    this.instruments = new Instruments(options.data);
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
		instruments: this.instruments.toJSON()
	    }));
        }
	
    });

    return InstrumentView;
});
