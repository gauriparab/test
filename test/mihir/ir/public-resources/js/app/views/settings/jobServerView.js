/* global define:false*/
define([
        'backbone',
        'models/settings/jobServer',
        'hb!templates/settings/services-jobs-server.html'
       ],
       function (
		    	Backbone,
		    	JobServer,
		    	template){
	
	'use strict';
	
	var JobServerView = Backbone.View.extend({
		
		model: new JobServer(),
		
		initialize: function(){
			this.model.fetch();
			this.listenTo(this.model, 'sync', this.render);
		},
		
		render: function(){
			this.$el.html(template({
				data: this.model.toJSON()
			}));
		}
		
	});
	
	return JobServerView;
});