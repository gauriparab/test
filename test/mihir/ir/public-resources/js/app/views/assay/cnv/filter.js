/*global define:false*/
define([
        'views/ParentView', 
        'events/eventDispatcher',
        'models/assay/cnv/filter',
        'hb!templates/assay/cnv/cnv-set-filter.html'],
    function(
    		ParentView, 
    		dispatcher,
    		Filter,
    		template) {
    "use strict";

    var FilterView = ParentView.extend({
	    initialize: function(options) {
	    	this.model = options.model;
	    	this.isEdit = this.model.get('isEdit');
	    	this.modelFragement = new Filter({
	    		id:this.model.getCnvBaselineId() || ''
	    	});
	    	
        },
        
        events:{
        	'change input': '_changed'
        },
        
        delegateEvents: function() {
            ParentView.prototype.delegateEvents.apply(this, arguments);
        },
        
        undelegateEvents: function() {
            ParentView.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
            var that = this;
            this.modelFragement.fetch({
	           	success: function(){
	           		that.$el.html(template({data:that.modelFragement.toJSON()}));
	           		that.model.setEvaluationParameters(that.modelFragement.toJSON());
	           		that.modelFragement.set('cnvBaselineId',that.model.get('cnvBaselineId'));
	           	}
	        });
            return this;
        },
        
        _changed: function(ev){
        	var target = $(ev.target);
        	
        	var v = target.val();
        	var index = target.data('index');
       		var model = this.modelFragement.toJSON();
       		model.evaluationQCDtoList[index].defaultThreshold = v;
           	this.model.setCnvFilters(model);
        }
    });
    return FilterView;
});
