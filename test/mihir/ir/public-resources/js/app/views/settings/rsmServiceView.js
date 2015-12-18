/* global define:false*/
define([
        'backbone',
        'models/settings/rsmService',
        'views/common/confirmModalView',
        'views/common/bannersView',
        'hb!templates/settings/services-rsm-service.html'
       ],
       function (
		    	Backbone,
		    	Service,
		    	ConfirmView,
		    	BannerView,
		    	template){
	
	'use strict';
	
	var RsmServiceView = Backbone.View.extend({
		
		model: new Service(),
		
		initialize: function(){
			this.listenTo(this.model, 'sync', this.render);
			this.model.fetch();
		},
		
		events:{
			'click span#status > a': 'triggerEvent'
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
			keys.headerKey = 'settings.rsm.confirm.title.' + type;
			keys.bodyKey = $.t('settings.rsm.confirm.message.' + type);
			ConfirmView.open(function() {
				$.ajax({
					url: '/ir/secure/api/settings/'+ type +'Service?processName=RSM_Launch',
          		    type: 'GET',
          		    contentType: 'application/json',
        		    success: function(data) {
        		    	new BannerView({
							id : 'success-banner',
							container : $('.main-content'),
							style : 'success',
							static : false,
							title : $.t('settings.rsm.success.message.' + type)
						}).render();
        		    	self.model.fetch();
        		    },
            		error: function(resp) {
            			new BannerView({
							id : 'error-banner',
							container : $('.main-content'),
							style : 'error',
							static : false,
							title : $.t('settings.rsm.failure.message.' + type)
						}).render();
            		}
        		});
			}, keys);
		}
		
	});
	
	return RsmServiceView;
});