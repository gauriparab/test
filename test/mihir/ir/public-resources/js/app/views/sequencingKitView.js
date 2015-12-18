define(['backbone', 
        'collections/sequencingKits',
        'events/eventDispatcher',
        'hb!templates/assay-sequencing-kit-view.html'], 
    function(Backbone, 
    		SequencingKits,
    		dispatcher,
    		template) {
	'use strict';
	
	var SequencingKitView = Backbone.View.extend({
		initialize: function() {
	    	this.collection = new SequencingKits();
	        this.listenTo(this.collection, 'sync', this.render);
	        this.model = this.options.model || null;
	        this.collection.fetch();
	    },
	    
	    events: {
	    	'change select#sequencingKit': 'selectionChanged'
	    },
	    
	    render: function() {
	        this.$el.html(template({
	            collection: this.collection.toJSON(),
	            idKey: "sequencingKit",
	            labelKey: "assay.summary.sequencingKit"
	        }));
	        
	        if(this.model.getSequencingKit()){
	        	$("#sequencingKit").val(this.model.getSequencingKit().id);
	        } else{
	        	var sequencingKit = this.collection.toJSON()[0];
	        	if(sequencingKit){
	        		this.model.setSequencingKit(sequencingKit);
	        		dispatcher.trigger('change:sequencingKit', sequencingKit);
	        	}
	        }
	        if(this.model.toJSON().applicationVersion.value == "IR36" && this.model.getApplicationType() == "DNA") {
	        	$('#sequencingKit').prop('disabled', 'disabled');
	        }
	        
	        return this;
	    },
	
	    selectionChanged: function(e) {
	        var value = $(e.currentTarget).val();
	        this.model.setSequencingKit(this.collection.get(value).toJSON());
	        dispatcher.trigger('set:updateFlowsFlag');
	        dispatcher.trigger('change:sequencingKit', this.model.getSequencingKit());
	    }
	});
	
	return SequencingKitView;
});