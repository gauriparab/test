define(['backbone',
        'events/eventDispatcher',
        'hb!templates/common/qc-control.html'], 
    function(Backbone,
    		dispatcher,
    		template) {
	'use strict';
	
	var ControlDetailsView = Backbone.View.extend({
		initialize: function() {
			
	    },
	    
	    events: {
	    	'change input:text': 'textChanged',
	    	'click a#resetAll': 'resetAll',
	    	'click a#resetAllDNA': 'resetAll',
	    	'click a#resetAllRNA': 'resetAll',
	    },
	    
	    render: function() {
	        this.$el.html(template(this.options.data));	 
	        if($("#variantHotspots td").length === 0)
	        	$("#variantHotspots").hide();
	        if($("#wildTypeHotspots td").length === 0)
	        	$("#wildTypeHotspots").hide();
	        if($("#driverGenes td").length === 0)
	        	$("#driverGenes").hide();
	        	
	        return this;
	    },
	
	    textChanged: function(e) {
	        var value = $(e.currentTarget).val();
	        var qcTypeId = $(e.currentTarget).attr('name');
	        var type=$(e.currentTarget).attr('alt');
	        if(type === 'threshold') {
	        	dispatcher.trigger("change:threshold", qcTypeId, value);
	        } else {
	        	dispatcher.trigger("change:upperThreshold", qcTypeId, value);
	        }
	    },
	    
	    resetAll: function(e){
	    	dispatcher.trigger("reset:threshold", $(e.currentTarget).attr('id').substring(8).trim());
	    }	    
	});
	
	return ControlDetailsView;
});