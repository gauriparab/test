/*global define:false*/
define([
        'views/ParentView', 
        'events/eventDispatcher',
        'hb!templates/assay/cnv/cnv-select.html'],
    function(
    		ParentView, 
    		dispatcher,
    		template) {
    "use strict";

    var CreationView = ParentView.extend({
    	events:{
    		//'change select': '_panelChanged',
    	},
    	
	    initialize: function(options) {
	    	this.data = options.data;
	    	this.isEdit = options.isEdit;
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
        	this.$el.html(template({
        		data:this.data,
        		isEdit:this.isEdit
        	}));
        	var selectEl = this.$el.find('select'); 
        	selectEl.on('change',function(){
				dispatcher.trigger('change:file', this);
			});
        	setTimeout(function(){
        		if(that.isEdit){
	        		selectEl.val(selectEl.find('option:nth-child(2)').val());
	        	} else{
	        		selectEl.val(that.selectedId);
	        	}
        		dispatcher.trigger('change:file', that.el);
        	},100);
        	dispatcher.trigger('change:file', this.el);
            return this;
        },
        
        _panelChanged: function(){
        	dispatcher.trigger('change:file', this.el);
        }
    });
    return CreationView;
});
