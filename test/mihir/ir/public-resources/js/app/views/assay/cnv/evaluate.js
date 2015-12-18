/*global define:false*/
define([
        'views/ParentView', 
        'events/eventDispatcher',
        'models/assay/cnv/evaluation',
        'hb!templates/assay/cnv/cnv-evaluation.html'],
    function(
    		ParentView, 
    		dispatcher,
    		Evaluation,
    		template) {
    "use strict";

    var EvaluationView = ParentView.extend({
	    initialize: function(options) {
	    	this.model = options.model;
	    	this.isEdit = this.model.get('isEdit');
	    	this.modelFragement = new Evaluation({
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
	           		that.modelFragement.set('isEdit',that.isEdit);
	           		that.modelFragement.set('cnvBaselineId',that.model.get('cnvBaselineId'));
	    	    	that.modelFragement.set('panelId',that.model.get('panelId'));
	           	}
	        });
            return this;
        },
        
        _changed: function(ev){
        	var target = $(ev.target);
        	
        	var v = target.val();
        	var index = target.data('index');
       		var model = this.modelFragement.toJSON();
       		model.parameters[index].value = v;
           	this.model.setEvaluationParameters(model);
        }
    });
    return EvaluationView;
});
