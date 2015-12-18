define(['backbone', 
        'hb!templates/templating-size-view.html'], 
    function(Backbone, 
    		template) {
	'use strict';
	
	var SequencingTemplatingSizeView = Backbone.View.extend({
		initialize: function(options) {
	    	this.collection = options.collection;
	    },
	    
	    render: function() {
	        this.$el.html(template({
	            collection: this.collection,
	            idKey: "tempKit2",
	        }));
	        this.$("#tempKit2").prop('disabled', 'disabled');
	        return this;
	    }
	    
	});
	
	return SequencingTemplatingSizeView;
});