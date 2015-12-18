/*global define:false*/
define([
        'views/ParentView', 
        'events/eventDispatcher',
        'models/assay/cnv/cnvReferenceModel',
        'hb!templates/assay/cnv/cnv-select.html'],
    function(
    		ParentView, 
    		dispatcher,
    		ReferenceModel,
    		template) {
    "use strict";

    var CreationView = ParentView.extend({
    	
    	events:{
    		//'change select': '_referenceChanged',
    	},
    	
	    initialize: function(options) {		    
	    	this.panelId = options.panelId;
	    	this.isDisabled = options.isDisabled;
	    	this.referenceModel = new ReferenceModel({
	    		id:this.panelId
	    	});
	    	this.selectedId = options.selected;
        },
        
        delegateEvents: function() {
            ParentView.prototype.delegateEvents.apply(this, arguments);
        },
        
        undelegateEvents: function() {
            ParentView.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
        	var that = this;
        	
        	this.referenceModel.fetch({
        		success:function(){
        			that.$el.html(template({
        				data:that.referenceModel.toJSON(),
        				isDisabled:that.isDisabled
    	        	}));
        			that.$el.find('select').val(that.selectedId);
        			that.$el.find('select').on('change',function(){
        				dispatcher.trigger('change:reference', this);
        			});
        		}
        	});
        	dispatcher.trigger('change:reference', this.el);
            return this;
        },
        
        _referenceChanged: function(){
        	dispatcher.trigger('change:reference', this.el);
        }
        
    });
    return CreationView;
});
