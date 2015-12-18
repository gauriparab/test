define(['backbone', 
        'collections/controlKit',
        'events/eventDispatcher',
        'hb!templates/common/select-dropdown-with-label.html'], 
    function(Backbone, 
    		ControlKit,
    		dispatcher,
    		template) {
	'use strict';
	
	var ControlKitView = Backbone.View.extend({
		initialize: function() {
	    	this.collection = new ControlKit();
	        this.listenTo(this.collection, 'sync', this.render);
	        this.model = this.options.model || null;
	        this.collection.fetch();
	    },
	    
	    events: {
	    	'change select#controlKit': 'selectionChanged'
	    },
	    
	    render: function() {
	        this.$el.html(template({
	            collection: this.collection.toJSON(),
	            idKey: "controlKit",
	            labelKey: "assay.summary.controlKit"
	        }));
	        
	        if(this.model.getControlKit()){
	        	$("#controlKit").val(this.model.getControlKit().id);
	        } else{
	        	var controlKit = this.collection.toJSON()[0];
	        	if(controlKit){
	        		this.model.setControlKit(controlKit);
	        		dispatcher.trigger('change:controlKit', controlKit);
	        	}
	        }
	        
	        return this;
	    },
	
	    selectionChanged: function(e) {
	        var value = $(e.currentTarget).val();
	        this.model.setControlKit(this.collection.get(value).toJSON());
	        dispatcher.trigger('change:controlKit', this.model.getControlKit());
	    }
	});
	
	return ControlKitView;
});