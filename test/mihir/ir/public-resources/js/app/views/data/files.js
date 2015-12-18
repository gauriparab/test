/* global define:false*/
define([
    'jquery',
    'backbone',
    'collections/data/files',
    'hb!templates/data/files.html'
],
    function(
        $,
        Backbone,
        Files,
        template) {
	'use strict';

    var FilesView = Backbone.View.extend({

        _template: template,

        initialize: function(options) {
            options = options || {};
            this.collection = new Files({
            	id: options.id
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
        		success: function(){
                    self.$el.html(self._template({
                    	files: self.collection.toJSON()
                    }));
        		}
        	});
        }
	
    });

    return FilesView;
});
