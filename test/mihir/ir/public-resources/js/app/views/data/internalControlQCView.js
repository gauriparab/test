/* global define:false*/
define([
    'jquery',
    'backbone',
    'collections/data/reviewControlQcs',
    'hb!templates/data/internal-control-qc.html'
],
    function(
        $,
        Backbone,
        Qcs,
        template) {
	'use strict';

    var InternalControlQcView = Backbone.View.extend({

        _template: template,

        initialize: function(options) {
            options = options || {};
            
			this.collection = new Qcs({ 
				resultId: options.id
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
                    	Qcs: self.collection.toJSON(),
                    }));
        		}
        	});
        }
	
    });

    return InternalControlQcView;
});
