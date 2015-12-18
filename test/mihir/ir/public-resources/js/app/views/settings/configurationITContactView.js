/* global define:false*/
define([
        'backbone',
        'models/settings/configurationITContact',
        'views/common/bannersView',
        'hb!templates/settings/configuration-IT-contact-view.html'
       ],
       function (
		    	Backbone,
		    	ConfigurationITContact,
		    	BannerView,
		    	template){
	
	'use strict';
	
	var ConfigurationITContactView = Backbone.View.extend({
		
		model: new ConfigurationITContact(),
		
		initialize: function(){
			this.listenTo(this.model, 'sync', this.render);
			this.model.fetch();
		},
		
		events:{
			'click #it-edit' : 'edit',
			'click #it-save' : 'save',
			'click #it-reset' : 'reset',
		},
		
		render: function(){
			this.$el.html(template({
				data: this.model.toJSON(),
			}));
			this.itInputs = this.$('.it-inputs input.reset');
		},
		
		edit: function() {
			this.$('#it-edit').css('display','none');
			this.$('#it-save').css('display','inline-block');
			this.itInputs.prop('disabled',false);
				
		},
		
		save: function() {
			this.model.set('name', this.$('#it-name').val());
			this.model.set('email', this.$('#it-email').val());
			this.model.set('phone', this.$('#it-phone').val());
			this.model.save(null,{
							success:function() {
								new BannersView({
									id : 'success-banner',
									container : $('.main-content #lab-messages'),
									style : 'success',
									static : false,
									title : 'Contact Details Updated Successfully'
								}).render();
								$('#it-save').css('display','none');
								$('#it-edit').css('display','inline-block');
								this.itInputs.prop('disabled',true);
							}
						});
			
		},
		
		reset: function() {
			this.model.fetch();
		}
	});
	
	return ConfigurationITContactView;
});