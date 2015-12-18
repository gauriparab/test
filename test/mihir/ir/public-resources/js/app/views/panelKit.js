define(['backbone', 
        'collections/panelKit',
        'events/eventDispatcher',
        'hb!templates/common/select-dropdown-with-label.html'], 
    function(Backbone, 
    		PanelKit,
    		dispatcher,
    		template) {
	'use strict';
	
	var PanelKitView = Backbone.View.extend({
		initialize: function() {
	    	this.collection = new PanelKit();
	        this.listenTo(this.collection, 'sync', this.render);
	        this.model = this.options.model || null;
	        this.collection.fetch();
	    },
	    
	    events: {
	    	'change select#panelKit': 'selectionChanged'
	    },
	    
	    render: function() {
	        this.$el.html(template({
	            collection: this.collection.toJSON(),
	            idKey: "panelKit",
	            labelKey: "assay.summary.panelKit"
	        }));
	        
	        if(this.model.getPanelKit()){
	        	$("#panelKit").val(this.model.getPanelKit().id);
	        } else{
	        	var panelKit = this.collection.toJSON()[0];
	        	if(panelKit){
	        		this.model.setPanelKit(panelKit);
	        		dispatcher.trigger('change:panelKit', panelKit);
	        	}
	        }
	        
	        return this;
	    },
	
	    selectionChanged: function(e) {
	        var value = $(e.currentTarget).val();
	        this.model.setPanelKit(this.collection.get(value).toJSON());
	        dispatcher.trigger('change:panelKit', this.model.getPanelKit());
	    }
	});
	
	return PanelKitView;
});