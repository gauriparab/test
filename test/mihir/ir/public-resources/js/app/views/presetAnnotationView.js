/*global define:false*/
define(['backbone', 
        'collections/annotationSets',
        'models/baseModel',
        'events/eventDispatcher',
        'hb!templates/common/select-dropdown-with-label.html'], 
    function(Backbone, 
        	AnnotationSets,
        	BaseModel,
        	dispatcher,
        	template) {
	
    "use strict";
    var AnnotationSetView = Backbone.View.extend({
        initialize: function(options) {
        	this.collection = new AnnotationSets();
            this.listenTo(this.collection, 'sync', this.render);
            this.model = options.model || null;
            this.temp = new BaseModel();
            this.temp.set("applicationType", this.model.getApplicationType());
            this.temp.set("version", this.model.getVersion());
            this.collection.getAllowed(this.temp);
        },

        events: {
            'change select#annotationSet': 'selectionChanged'
        },

        render: function() {
            this.$el.html(template({
                collection: _.filter(this.collection.toJSON(), function(set){ return set.status !== 'INVALID'; }),
                idKey: "annotationSet",
                labelKey: "assay.summary.annotation",
                canBeNone: true
            }));
            if(this.model.getAnnotationSet()){
            	$("#annotationSet").val(this.model.getAnnotationSet().id);
            	dispatcher.trigger('change:annotationSet', this.model.getAnnotationSet());
            } else{
            	var annotationSet = this.collection.toJSON()[0];
            	if(annotationSet){
            		this.model.setAnnotationSet(annotationSet);
            		dispatcher.trigger('change:annotationSet', annotationSet);
            	}
            }
            
            return this;
        },

        selectionChanged: function(e) {
            var value = $(e.currentTarget).val();
            this.model.setAnnotationSet(this.collection.get(value).toJSON());            
            dispatcher.trigger('change:annotationSet', this.model.getAnnotationSet());
        }
    });

    return AnnotationSetView;
});
