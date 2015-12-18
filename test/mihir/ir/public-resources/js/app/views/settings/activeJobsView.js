/* global define:false*/
define([
        'backbone',
        'collections/settings/activeJobs',
        'views/common/bannersView',
        'views/common/confirmModalView',
        'hb!templates/settings/services-jobs-active.html'
       ],
       function (
		    	Backbone,
		    	ActiveJobs,
		    	BannerView,
		    	Confirm,
		    	template){
	
	'use strict';
	
	var ActiveJobsView = Backbone.View.extend({
		
		collection: new ActiveJobs(),
		
		initialize: function(){
			this.collection.fetch();
			this.listenTo(this.collection, 'sync', this.render);
		},
		
		events:{
			'click a.terminateLink': 'terminateJob'
		},
		
		render: function(){
			this.$el.html(template({
				data: this.collection.toJSON()
			}));
		},
		
		terminateJob: function(e) {
			var self = this;
			Confirm.open(function() {
				var jobId = $(e.currentTarget).data('jobid');
				$.ajax({
			        url: '/ir/secure/api/settings/terminateJob?jobId='+jobId,
			        type: 'GET',
			        contentType: 'application/json',
			        dataType: 'json',
			        success: function() {
			        	self.collection.fetch();
			        	new BannerView({
							id : 'change-state-success-banner',
							container : $('.main-content'),
							style : 'success',
							title : $.t('job.terminate.success')
						}).render();
			        }
				});
		},{
			headerKey : 'confirm.terminate.job.title',
			bodyKey : 'job.terminate.confirm',
		});
		}
		
	});
	
	return ActiveJobsView;
});