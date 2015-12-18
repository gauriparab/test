/*global define:false*/
define(['views/ParentView', 
        'views/presetAnnotationView',
        'views/presetFilterChainView',
        'views/presetClassificationView',
        'models/preset',
        'events/eventDispatcher', 
        'hb!templates/presets.html'],
    function(ParentView, 
            AnnoatationView,
            FilterChainView,
            ClassificationView,
            Preset,
            dispatcher, 
            template) {
    "use strict";
            
    var VariantDetectionParameters = ParentView.extend({
        initialize: function() {
        	dispatcher.on('change:annotationSet', this._annotationSetChanged, this);
        	dispatcher.on('change:filterChain', this._filterChainChanged, this);
        	dispatcher.on('change:classificationSet', this._classificationSetChanged, this);
            this.modelFragement = new Preset(); 
            this.modelFragement.setAssayId(this.model.getAssayId());
        },
        
        delegateEvents: function() {
            ParentView.prototype.delegateEvents.apply(this, arguments);
        },
        
        undelegateEvents: function() {
            ParentView.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
        	var self = this;
        	this.modelFragement.fetch({
        		success: function(){
        			self.model.setAnnotationSet(self.modelFragement.getAnnotationSet());
        			self.model.setClassificationSet(self.modelFragement.getClassificationSet());
        			self.model.setFilterChain(self.modelFragement.getFilterChain());
        			self.$el.html(template());
                    self.annotationSetView = new AnnoatationView({
                    	model: self.model
                    });
                    self.filterChainView = new FilterChainView({
                    	model: self.model
                    });
                    self.classificationView = new ClassificationView({
                    	model: self.model
                    });
                    self.renderSubView(self.annotationSetView, "#annotationSetDiv");
                    self.renderSubView(self.classificationView, "#classificationSetDiv");
                    self.renderSubView(self.filterChainView, "#filterChainDiv");
        		}
        	})
            
            return this;
        },
        
        _classificationSetChanged: function(classificationSet){
        	this.modelFragement.setClassificationSet(classificationSet)
        },
        
        _annotationSetChanged: function(annotationSet){
        	this.modelFragement.setAnnotationSet(annotationSet);
        	this.model.setAnnotationSet(annotationSet);
        },
        
        _filterChainChanged: function(filterChain){
        	this.modelFragement.setFilterChain(filterChain);
        }
        
    });

    return VariantDetectionParameters;
});