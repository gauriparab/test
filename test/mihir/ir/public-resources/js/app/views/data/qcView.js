/* global define:false*/
define([
    'jquery',
    'backbone',
    'collections/data/Qcs',
    'hb!templates/data/qc.html'
],
    function(
        $,
        Backbone,
        Qcs,
        template) {
	'use strict';

    var RunQcView = Backbone.View.extend({

        _template: template,

        initialize: function(options) {
            options = options || {};
            
			this.collection = new Qcs({ 
				id: options.id,
				type: options.type
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
                    	qcType: self.options.type
                    }));
        		}
        	});
        }
	
    });

    return RunQcView;
});
