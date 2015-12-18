/*global define:false*/
define([
        'views/ParentView', 
        'events/eventDispatcher',
        'hb!templates/panel-reference.html'],
    function(
    		ParentView, 
    		dispatcher,
    		template) {
    "use strict";

    var SaveCNVView = ParentView.extend({
	    initialize: function(options) {		    

        },
        
        delegateEvents: function() {
            ParentView.prototype.delegateEvents.apply(this, arguments);
        },
        
        undelegateEvents: function() {
            ParentView.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
        	this.$el.html(template({}));
            var self = this;
            return this;
        }
    });
    return SaveCNVView;
});
