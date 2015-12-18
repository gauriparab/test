define(['views/ParentView', 
        'collections/templatingKits',
        'views/sequencingKitView',
        'views/templatingSizeView',
        'views/sequencingTemplatingSizeView',
        'events/eventDispatcher',
        'hb!templates/assay-templating-kit-view.html'], 
    function(ParentView, 
    		TemplatingKits,
    		SequencingKitView,
    		TemplatingSizeView,
    		SequencingTemplatingSizeView,
    		dispatcher,
    		template) {
	'use strict';
	
	var TemplateKitView = ParentView.extend({
		initialize: function() {
	    	this.collection = new TemplatingKits();
	        this.listenTo(this.collection, 'sync', this.render);
	        this.model = this.options.model || null;
	        this.collection.fetch();
	    },
	    
	    events: {
	    	'change select#templatingKit': 'selectionChanged',
			'change select#tempKit':'templatingKitChanged'
	    },
	    
	    render: function() {
	        this.$el.html(template({
	            collection: this.collection.toJSON(),
	            idKey: "templatingKit",
	            labelKey: "assay.summary.templatingKit"
	        }));
	        
    		var selectedTemplateSize;
	        if(this.model.getTemplatingKit()){
	        	$("#templatingKit").val(this.model.getTemplatingKit().id);
	        	selectedTemplateSize=this.model.getTemplatingKit().selectedTemplateSize
	        } else{
	        	var templatingKit = this.collection.toJSON()[0];
	        	if(templatingKit){
	        		this.model.setTemplatingKit(templatingKit);
	        	}
	        }
	        this.skipUpdateFlows=true;
	        this.selectionChanged();
	        if(selectedTemplateSize) {
	        	$("select#tempKit").val(selectedTemplateSize.value);
	        	this.templatingKitChanged();
	        }
	        
	        
	        this.sequencingKitView = new SequencingKitView({
	        	model: this.model
	        });
	        this.renderSubView(this.sequencingKitView, "#sequencingKitDiv");
	        
	        if(this.model.toJSON().applicationVersion.value == "IR36" && this.model.getApplicationType() == "DNA") {
	        	$('#templatingKit').prop('disabled', 'disabled');
				$('#tempKit').prop('disabled', 'disabled');
				$('#tempKit2').prop('disabled', 'disabled');
	        }
	        return this;
	    },
	
	    selectionChanged: function() {
	        var value = this.$el.find('select#templatingKit').val();
	        if(value) {
	        	var mod = this.collection.get(value).toJSON();
				
				this.updateTemplateSizes(mod.templatingSize);
							
				var _template = this.$el.find('#tempKit')[0].selectedIndex;
				
				mod.selectedTemplateSize = mod.templatingSize[_template];
				
				this.model.setTemplatingKit(mod);
				this.$el.find('#_desc').html(mod.description);
		        dispatcher.trigger('change:templatingKit', this.model.getTemplatingKit());
	        }
	    },
		
	    updateTemplateSizes: function(sizes) {
	    	this.templatingSizeView = new TemplatingSizeView({
	        	collection: sizes
	        });
	        this.renderSubView(this.templatingSizeView, "#tempSize");
	        this.sequencingTemplatingSizeView = new SequencingTemplatingSizeView({
	        	collection: sizes
	        });
	        this.renderSubView(this.sequencingTemplatingSizeView, "#sequencingTempSize");
	        if(!this.skipUpdateFlows) {
				dispatcher.trigger('set:updateFlowsFlag');
			}
	        this.skipUpdateFlows=false;
			setTimeout(function(){dispatcher.trigger('update:selection');},300);
	    },
		
		templatingKitChanged: function(){
			var v = this.$el.find('select#tempKit').val();
			if(v) {
				var templatingKit=this.model.getTemplatingKit();
				var templatingSize=_.filter(templatingKit.templatingSize, function(size) {
					return size.value == v;
				});
				templatingKit.selectedTemplateSize = templatingSize[0];
				this.model.setTemplatingKit(templatingKit);
	    		dispatcher.trigger('change:templatingKit', templatingKit);
				dispatcher.trigger('set:updateFlowsFlag');
				dispatcher.trigger('change:selection');
				$("select#tempKit2").val(v);
			}
		}
	});
	
	return TemplateKitView;
});