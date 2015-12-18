/*global define:false*/
define(['backbone',
        'models/baseModel',
        'collections/fusionPanels',
        'events/eventDispatcher',
        'hb!templates/common/fusion-panel-dropdown-with-label.html'], 
    function(Backbone,
    		BaseModel,
    		FusionPanels,
    		dispatcher,
    		template) {
    "use strict";
    var FusionCollectionView = Backbone.View.extend({
        initialize: function() {
        	this.collection = new FusionPanels();
            this.listenTo(this.collection, 'sync', this.render);
            this.model = this.options.model || null;
            this.collection.getAllowed(new BaseModel({
            	applicationType: this.model.getApplicationType(),
            	version: this.model.getVersion(),
            	referenceFileId: this.options.model.toJSON().fusionReference.id
            }));
        },

        events: {
            'change select#fusionPanel': 'selectionChanged'
        },

        render: function() {
            this.$el.html(template({
                collection: this.collection.toJSON(),
                idKey: 'fusionPanel',
                labelKey: 'workflow.fusion.panel.label'
            }));
            if(this.model.getFusionPanel()){
            	$("#fusionPanel").val(this.model.getFusionPanel().id);
            	$("#fusionPanel").trigger('change', {});
            } else{
            	var fusion = this.collection.toJSON()[0];
            	if(fusion){
            		this.model.setFusionPanel(fusion);
            		dispatcher.trigger('change:fusionBed', fusion);
            	}
            }
            return this;
        },

        selectionChanged: function(e) {
            var value = $(e.currentTarget).val();
            
            var thisPanel = this.collection.get(value);
            
            if(thisPanel){
            	this.model.setFusionPanel(thisPanel.toJSON());
            }
            
            dispatcher.trigger('change:fusionBed', this.model.getFusionPanel());
        }
    });

    return FusionCollectionView;
});
