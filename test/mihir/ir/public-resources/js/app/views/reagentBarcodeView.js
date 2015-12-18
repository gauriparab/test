define(['backbone', 
        'collections/reagentBarcodes',
        'events/eventDispatcher',
        'hb!templates/common/select-dropdown-with-label.html'], 
    function(Backbone, 
    		ReagentBarcodes,
    		dispatcher,
    		template) {
	'use strict';
	
	var ReagentBarcodeView = Backbone.View.extend({
		initialize: function() {
	    	this.collection = new ReagentBarcodes();
	        this.listenTo(this.collection, 'sync', this.render);
	        this.model = this.options.model || null;
	        this.collection.fetch();
	    },
	    
	    events: {
	    	'change select#barcodeKit': 'selectionChanged'
	    },
	    
	    render: function() {
	        this.$el.html(template({
	            collection: this.collection.toJSON(),
	            idKey: "barcodeKit",
	            labelKey: "assay.summary.barcodeKit"
	        }));
	        
	        if(this.model.getReagentBarcode()){
	        	$("#barcodeKit").val(this.model.getReagentBarcode().id);
	        } else{
	        	var barcodeKit = this.collection.toJSON()[0];
	        	if(barcodeKit){
	        		this.model.setReagentBarcode(barcodeKit);
	        		dispatcher.trigger('change:barcodeKit', barcodeKit);
	        	}
	        }
	        if(this.model.toJSON().applicationVersion.value == "IR36" && this.model.getApplicationType() == "DNA") {
	        	$('#barcodeKit').prop('disabled', 'disabled');
	        }
	        
	        return this;
	    },
	
	    selectionChanged: function(e) {
	        var value = $(e.currentTarget).val();
	        this.model.setReagentBarcode(this.collection.get(value).toJSON());
	        dispatcher.trigger('change:barcodeKit', this.model.getReagentBarcode());
	    }
	});
	
	return ReagentBarcodeView;
});