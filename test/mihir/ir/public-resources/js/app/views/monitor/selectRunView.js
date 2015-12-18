define(['backbone', 
        'collections/monitor/runs',
        'events/eventDispatcher',
        'hb!templates/monitor/select-run-view.html'], 
    function(Backbone, 
    		Runs,
    		dispatcher,
    		template) {
	'use strict';
	
	var SelectRunView = Backbone.View.extend({
		initialize: function(options) {
	    	this.collection = new Runs();
	    	this.selectedPlanId=options.selectedPlanId;
	    },
	    
	    events: {
	    	'change select#filterRuns': 'selectionChanged'
	    },
	    
	    render: function() {
	    	var self=this;
	    	this.collection.fetch({
	    		success: function() {
	    			self.$el.html(template({
	    	            runsList: self.collection.toJSON(),
	    	        }));
	    			if(self.selectedPlanId) {
	    				$("#filterRuns").val(self.selectedPlanId);
	    				dispatcher.trigger('render:run', self.selectedPlanId);
	    			} else {
	    				dispatcher.trigger('render:run', self.collection.toJSON()[0].id);
	    			}
	    		}
	    	});
	        
	        return this;
	    },
	
	    selectionChanged: function(e) {
	        var value = $(e.currentTarget).val();
	        dispatcher.trigger('change:run', value);
	    }
	});
	
	return SelectRunView;
});