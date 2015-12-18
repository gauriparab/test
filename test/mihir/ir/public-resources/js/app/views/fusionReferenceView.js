/*global define:false*/
define(['backbone', 
        'models/baseModel',
        'collections/fusionReferences',
        'events/eventDispatcher',
        'hb!templates/common/select-dropdown-with-label.html'], 
    function(Backbone,
    		BaseModel,
    		FusionReferences,
    		dispatcher,
        	template) {
    "use strict";
    var FusionReferenceView = Backbone.View.extend({
        initialize: function() {
        	this.collection = new FusionReferences();
            this.listenTo(this.collection, 'sync', this.render);
            this.model = this.options.model || null;
            this.collection.getAllowed(new BaseModel({
            	applicationType: this.model.getApplicationType(),
            	version: this.model.getVersion()
            }));
        },

        events: {
            'change select#fusionReference': 'selectionChanged'
        },

        render: function() {
            this.$el.html(template({
            	collection: this.collection.toJSON(),
            	idKey: 'fusionReference',
            	labelKey: 'workflow.fusion.reference.label',
            	canBeNone: true
            }));
            if(this.model.getFusionReference()){
            	$("#fusionReference").val(this.model.getFusionReference().id); 
            	dispatcher.trigger('change:fusionReference',this.model.getFusionReference());
            } else{
            	var reference = this.collection.toJSON()[0];
            	if(reference){
            		this.model.setFusionReference(reference);
            		dispatcher.trigger('change:fusionReference', reference);
            	}
            }
            
            return this;
        },

        selectionChanged: function(e) {
            var value = $(e.currentTarget).val();
            this.model.setFusionReference(this.collection.get(value).toJSON());
            dispatcher.trigger('change:fusionReference', this.model.getFusionReference());
        }
    });

    return FusionReferenceView;
});
