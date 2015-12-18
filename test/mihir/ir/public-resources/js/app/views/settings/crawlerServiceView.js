/* global define:false*/
define([
        'backbone',
        'models/settings/crawlerService',
        'views/common/confirmModalView',
        'views/common/bannersView',
        'hb!templates/settings/services-crawler-service.html'
       ],
       function (
		    	Backbone,
		    	CrawlerService,
		    	ConfirmView,
		    	BannerView,
		    	template){
	
	'use strict';
	
	var CrawlerServiceView = Backbone.View.extend({
		
		model: new CrawlerService(),
		
		events:{
			'click span#status > a': 'triggerEvent'
		},
		
		initialize: function(){
			this.listenTo(this.model, 'sync', this.render);
			this.model.fetch();
		},
		
		render: function(){
			this.$el.html(template({
				data: this.model.toJSON()
			}));
		},
		
		triggerEvent: function(e){
			var self = this;
			var type = $(e.currentTarget).data("type");
			var keys = {};
			keys.headerKey = 'settings.crawler.confirm.title.' + type;
			keys.bodyKey = 'settings.crawler.confirm.message.' + type;

			ConfirmView.open(function() {
				$.ajax({
					url: '/ir/secure/api/settings/'+ type +'Service?processName=crawler',
          		    type: 'GET',
          		    contentType: 'application/json',
        		    success: function(data) {
        		    	new BannerView({
							id : 'success-banner',
							container : $('.main-content'),
							style : 'success',
							static : false,
							title : $.t('settings.crawler.success.message.' + type)
						}).render();
        		    	self.model.fetch();
        		    },
            		error: function(resp) {
            			new BannerView({
							id : 'error-banner',
							container : $('.main-content'),
							style : 'error',
							static : false,
							title : $.t('settings.crawler.failure.message.' + type)
						}).render();
            		}
        		});
			}, keys);
		}
		
	});
	
	return CrawlerServiceView;
});