/* global define:false*/
define([
        'backbone',
        'models/settings/subservices',
        'views/common/confirmModalView',
        'views/common/bannersView',
        'hb!templates/settings/services-jobs-service.html'
       ],
       function (
		    	Backbone,
		    	Service,
		    	ConfirmView,
		    	BannerView,
		    	template){
	
	'use strict';
	
	var ServicesView = Backbone.View.extend({
		
		model: new Service(),
		
		initialize: function(){
			this.listenTo(this.model, 'sync', this.render);
			this.model.fetch();
		},
		
		events:{
			'click td > a': 'triggerEvent'
		},
		
		render: function(){
			this.$el.html(template({
				data: this.model.toJSON(),
				userRole: this.options.userRole
			}));
		},
		
		triggerEvent: function(e){
			var self = this;
			var type = $(e.currentTarget).data("type");
			var keys = {};
			var name = $(e.currentTarget).data("service");
			keys.headerKey = 'settings.services.confirm.title.' + type;
			keys.bodyKey = $.t('settings.services.confirm.message.' + type) + ' ' + name + "?";
			ConfirmView.open(function() {
				$.ajax({
					url: '/ir/secure/api/settings/'+ type +'Service?processName=' + name,
          		    type: 'GET',
          		    contentType: 'application/json',
        		    success: function(data) {
        		    	new BannerView({
							id : 'success-banner',
							container : $('.main-content'),
							style : 'success',
							static : false,
							title : $.t('settings.services.success.message.' + type) + " " + name
						}).render();
        		    	self.model.fetch();
        		    },
            		error: function(resp) {
            			new BannerView({
							id : 'error-banner',
							container : $('.main-content'),
							style : 'error',
							static : false,
							title : $.t('settings.services.failure.message.' + type) + " " + name
						}).render();
            		}
        		});
			}, keys);
		}
		
	});
	
	return ServicesView;
});