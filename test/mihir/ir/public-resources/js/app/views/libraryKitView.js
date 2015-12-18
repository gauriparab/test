define(['backbone', 
        'collections/libraryKitTypes',
        'events/eventDispatcher',
        'hb!templates/common/select-dropdown-with-label.html'], 
    function(Backbone, 
    		LibraryKitTypes,
    		dispatcher,
    		template) {
	'use strict';
	
	var LibraryKitView = Backbone.View.extend({
		initialize: function() {
	    	this.collection = new LibraryKitTypes();
	        this.listenTo(this.collection, 'sync', this.render);
	        this.model = this.options.model || null;
	        this.collection.fetch();
	    },
	    
	    events: {
	    	'change select#libraryKitType': 'selectionChanged'
	    },
	    
	    render: function() {
	        this.$el.html(template({
	            collection: this.collection.toJSON(),
	            idKey: "libraryKitType",
	            labelKey: "assay.summary.libraryKitType"
	        }));
	        
	        if(this.model.getLibraryKitType()){
	        	$("#libraryKitType").val(this.model.getLibraryKitType().id);
	        } else{
	        	var libraryKitType = this.collection.toJSON()[0];
	        	if(libraryKitType){
	        		this.model.setLibraryKitType(libraryKitType);
	        		dispatcher.trigger('change:libraryKitType', libraryKitType);
	        	}
	        }
	        if(this.model.toJSON().applicationVersion.value == "IR36" && this.model.getApplicationType() == "DNA") {
	        	$('#libraryKitType').prop('disabled', 'disabled');
	        }
	        
	        return this;
	    },
	
	    selectionChanged: function(e) {
	        var value = $(e.currentTarget).val();
	        this.model.setLibraryKitType(this.collection.get(value).toJSON());
	        dispatcher.trigger('change:libraryKitType', this.model.getLibraryKitType());
	    }
	});
	
	return LibraryKitView;
});