define(['backbone', 
        'events/eventDispatcher',
        'hb!templates/templating-size-view.html'], 
    function(Backbone, 
    		dispatcher,
    		template) {
	'use strict';
	
	var TemplatingSizeView = Backbone.View.extend({
		initialize: function(options) {
	    	this.collection = options.collection;
	    },
	    
	    render : function() {
	        this.$el.html(template({
	            collection: this.collection,
	            idKey: "tempKit",
	        }));
	        return this;
	    }
	
	});
	
	return TemplatingSizeView;
});