/*global define:false*/
define(['backbone', 
        'models/baseModel',
        'collections/panels',
        'events/eventDispatcher',
        'hb!templates/common/select-dropdown-with-label.html'], 
    function(Backbone, 
    		BaseModel,
    		Panels,
    		dispatcher,
    		template) {
    "use strict";
    var PanelCollectionView = Backbone.View.extend({
        initialize: function() {
        	this.collection = new Panels({
        		genomeId: this.options.id
        	});
            this.listenTo(this.collection, 'sync', this.render);
            this.model = this.options.model || null;
            if(this.options.id) {
            	this.collection.getAllowed(new BaseModel({
                	applicationType: this.model.getApplicationType(),
                	version: this.model.getVersion()
                }));
            }
        },

        events: {
            'change select#panel': 'selectionChanged'
        },

        render: function() {
            this.$el.html(template({
                collection: this.collection.toJSON(),
                idKey: "panel",
                labelKey: "assay.panel.label",
                canBeNone: true
            }));
            
            if(this.model.getPanel()){
            	$("#panel").val(this.model.getPanel().id);
            } else{
            	var panel = this.collection.toJSON()[0];
            	if(panel.name){
            		this.model.setPanel(panel);
            		dispatcher.trigger('change:panelBed', panel);
            	}
            }
            
            return this;
        },

        selectionChanged: function(e) {
            var value = $(e.currentTarget).val();
            this.model.setPanel(this.collection.get(value).toJSON());
            dispatcher.trigger('change:panelBed', this.model.getPanel());
        }
    });

    return PanelCollectionView;
});
