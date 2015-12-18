/*global define:false*/
define(['backbone', 
        'models/baseModel',
        'collections/hotspots',
        'events/eventDispatcher',
        'hb!templates/common/select-dropdown-with-label.html'], 
    function(Backbone, 
    		BaseModel,
    		Hotspots,
    		dispatcher,
    		template) {
    "use strict";
    var HotspotView = Backbone.View.extend({
        initialize: function() {
        	this.collection = new Hotspots();
            this.listenTo(this.collection, 'sync', this.render);
            this.model = this.options.model || null;
            this.collection.getAllowed(new BaseModel({
            	applicationType: this.model.getApplicationType(),
            	version: this.model.getVersion()
            }));
        },

        events: {
            'change select#hotspots': 'selectionChanged'
        },

        render: function() {
            this.$el.html(template({
                collection: this.collection.toJSON(),
                idKey: "hotspots",
                labelKey: "assay.variantDetection.hotspots",
                mode:this.model.get('applicationMode').toLowerCase()
            }));
            
            if(this.model.getHotspot()){
            	$("#hotspots").val(this.model.getHotspot().id);
            } else{
            	var hotspot = this.collection.toJSON()[0];
            	if(hotspot){
            		this.model.setHotspot(hotspot);
            		dispatcher.trigger('change:hotspotBed', hotspot);
            	}
            }
            
            return this;
        },

        selectionChanged: function(e) {
            var value = $(e.currentTarget).val();
            this.model.setHotspot(this.collection.get(value).toJSON());
            dispatcher.trigger('change:hotspotBed', this.model.getHotspot());
        }
    });

    return HotspotView;
});
