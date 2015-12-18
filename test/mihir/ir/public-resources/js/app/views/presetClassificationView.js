/*global define:false*/
define(['backbone', 
        'collections/classificationSets',
        'models/baseModel',
        'events/eventDispatcher',
        'hb!templates/common/select-dropdown-with-label.html'], 
    function(Backbone, 
    		ClassificationSets,
        	BaseModel,
        	dispatcher,
        	template) {
	
    "use strict";
    var ClassificationSetView = Backbone.View.extend({
        initialize: function(options) {
        	this.collection = new ClassificationSets();
            this.listenTo(this.collection, 'sync', this.render);
            this.model = options.model || null;
            this.temp = new BaseModel();
            this.temp.set("applicationType", this.model.getApplicationType());
            this.temp.set("version", this.model.getVersion());
            this.collection.getAllowed(this.temp);
        },

        events: {
            'change select#classificationSet': 'selectionChanged'
        },

        render: function() {
            this.$el.html(template({
                collection: this.collection.toJSON(),
                idKey: "classificationSet",
                labelKey: "assay.summary.classification",
                canBeNone: true
            }));
            if(this.model.getClassificationSet()){
            	$("#classificationSet").val(this.model.getClassificationSet().id);
            	dispatcher.trigger('change:classificationSet', this.model.getClassificationSet());
            } else{
            	var classificationSet = this.collection.toJSON()[0];
            	if(classificationSet){
            		this.model.setClassificationSet(classificationSet);
            		dispatcher.trigger('change:classificationSet', classificationSet);
            	}
            }
            
            return this;
        },

        selectionChanged: function(e) {
            var value = $(e.currentTarget).val();
            this.model.setClassificationSet(this.collection.get(value).toJSON());            
            dispatcher.trigger('change:classificationSet', this.model.getClassificationSet());
        }
    });

    return ClassificationSetView;
});
