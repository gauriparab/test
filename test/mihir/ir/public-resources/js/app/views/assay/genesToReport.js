/*global define:false*/
define([
        'views/ParentView',
        'events/eventDispatcher',
        'hb!templates/assay/presets-genes-to-report.html'],
    function(
    	ParentView,
    	Dispatcher,
    	template) {
    "use strict";

    var GenesToReport = ParentView.extend({
    	_template : template,

    	initialize: function(options) {
    		this.data = options.genes
    		console.log(options);
        },

        events: {
        	'click [type="checkbox"]':'onClick'
        },
        
        delegateEvents: function() {
        	Backbone.View.prototype.delegateEvents.apply(this, arguments);
        },

        render: function() {
        	var that = this;
        	console.log('test');
        	this.$el.html(this._template({
				genes: this.data
			}));
        },
        
        onClick: function(e) {
        	var checkboxes= $("#genesToReport input:checked");
        	if(checkboxes.length === 0){
        		Dispatcher.trigger('genes:unchecked');
        	} else if (checkboxes.length === 1){
        		var checkbox = $(e.currentTarget);
        		if(checkbox.is(':checked'))
        			Dispatcher.trigger('genes:checked');
        	}
        	
        },
        
        save: function() {}
    });

    return GenesToReport;
});
