/*global define:false*/
define(['backbone', 
        'collections/referenceGenomes',
        'events/eventDispatcher',
        'hb!templates/common/select-dropdown-with-label.html'], 
    function(Backbone, 
        	ReferenceGenomesCollection,
        	dispatcher,
        	template) {
	
    "use strict";
    var ReferenceGenomeCollectionView = Backbone.View.extend({
        initialize: function(options) {
        	this.collection = new ReferenceGenomesCollection();
            this.listenTo(this.collection, 'sync', this.render);
            this.model = options.model || null;
            this.collection.fetch();
        },

        events: {
            'change select#reference': 'selectionChanged'
        },

        render: function() {
            this.$el.html(template({
                collection: this.collection.toJSON(),
                idKey: "reference",
                labelKey: "assay.details.genomeRef",
                canBeNone: (this.model.getApplicationType() === 'DNA_GENERIC') ? true : false
            }));
            this.renderReference();
            
            return this;
        },
        
        renderReference : function() {
        	if(this.model.getApplicationType() === 'DNA_GENERIC'){
            	if(this.model.getReference()){
            		$("#reference").val(this.model.getReference().id);
	            	dispatcher.trigger('change:genomeReference', this.model.getReference());
            	} else {
            		$("#reference").val(-1);
                	dispatcher.trigger('change:genomeReference', null);
            	}
            } else{
            	if(this.model.getReference()){
	            	$("#reference").val(this.model.getReference().id);
	            	dispatcher.trigger('change:genomeReference', this.model.getReference());
	            } else{
	            	var reference = this.collection.toJSON()[0];
	            	if(reference){
	            		this.model.setReference(reference);
	            		dispatcher.trigger('change:genomeReference', reference);
	            	}
	            }
            }
            if(this.model.toJSON().applicationVersion.value == "IR36" && this.model.getApplicationType() == "DNA") {
				$('#reference').prop('disabled', 'disabled');
			}
        },

        selectionChanged: function(e) {
            var value = $(e.currentTarget).val();
            if(value != -1){
            	this.model.setReference(this.collection.get(value).toJSON());
            } else{
            	this.model.setReference({
            		id:$("#reference").val(),
            		name:$("#reference option:selected").text()
            	});
            }
            dispatcher.trigger('change:genomeReference', this.model.getReference());
        }
    });

    return ReferenceGenomeCollectionView;
});
