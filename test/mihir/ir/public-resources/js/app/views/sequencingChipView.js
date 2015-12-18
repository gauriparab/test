define(['backbone', 
        'collections/sequencingChips',
        'events/eventDispatcher',
        'hb!templates/common/select-dropdown-with-label.html'], 
    function(Backbone, 
    		SequencingChips,
    		dispatcher,
    		template) {
	'use strict';
	
	var SequencingChipView = Backbone.View.extend({
		initialize: function() {
	    	this.collection = new SequencingChips();
	        this.listenTo(this.collection, 'sync', this.render);
	        this.model = this.options.model || null;
	        this.collection.fetch();
	    },
	    
	    events: {
	    	'change select#sequencingChip': 'selectionChanged'
	    },
	    
	    render: function() {
	        this.$el.html(template({
	            collection: this.collection.toJSON(),
	            idKey: "sequencingChip",
	            labelKey: "assay.summary.sequencingChip"
	        }));
	        
	        if(this.model.getSequencingChip()){
	        	$("#sequencingChip").val(this.model.getSequencingChip().id);
	        } else{
	        	var sequencingChip = this.collection.toJSON()[0];
	        	if(sequencingChip){
	        		this.model.setSequencingChip(sequencingChip);
	        		dispatcher.trigger('change:sequencingChip', sequencingChip);
	        	}
	        }
	        
	        if(this.model.toJSON().applicationVersion.value == "IR36" && this.model.getApplicationType() == "DNA") {
	        	$('#sequencingChip').prop('disabled', 'disabled');
	        }
	        return this;
	    },
	
	    selectionChanged: function(e) {
	        var value = $(e.currentTarget).val();
	        this.model.setSequencingChip(this.collection.get(value).toJSON());
	        dispatcher.trigger('set:updateFlowsFlag');
	        dispatcher.trigger('change:sequencingChip', this.model.getSequencingChip());
	    }
	});
	
	return SequencingChipView;
});