define(['backbone', 
        'collections/extractionKits',
        'events/eventDispatcher',
        'hb!templates/common/select-dropdown-with-label.html'], 
    function(Backbone, 
    		ExtractionKits,
    		dispatcher,
    		template) {
	'use strict';
	
	var ExtractionKitView = Backbone.View.extend({
		initialize: function() {
	    	this.collection = new ExtractionKits();
	        this.listenTo(this.collection, 'sync', this.render);
	        this.model = this.options.model || null;
	        this.collection.fetch();
	    },
	    
	    events: {
	    	'change select#extractionKit': 'selectionChanged'
	    },
	    
	    render: function() {
	        this.$el.html(template({
	            collection: this.collection.toJSON(),
	            idKey: "extractionKit",
	            labelKey: "assay.summary.extractionKit"
	        }));
	        
	        if(this.model.getExtractionKit()){
	        	$("#extractionKit").val(this.model.getExtractionKit().id);
	        } else{
	        	var extractionKit = this.collection.toJSON()[0];
	        	if(extractionKit){
	        		this.model.setExtractionKit(extractionKit);
	        		dispatcher.trigger('change:extractionKit', extractionKit);
	        	}
	        }
	        
	        return this;
	    },
	
	    selectionChanged: function(e) {
	        var value = $(e.currentTarget).val();
	        this.model.setExtractionKit(this.collection.get(value).toJSON());
	        dispatcher.trigger('change:extractionKit', this.model.getExtractionKit());
	    }
	});
	
	return ExtractionKitView;
});