/* global define:false*/
define([
        'backbone',
        'models/settings/configurationLabContact',
        'views/common/bannersView',
        'hb!templates/settings/configuration-lab-contact-view.html'
       ],
       function (
		    	Backbone,
		    	ConfigurationLabContact,
		    	BannerView,
		    	template){
	
	'use strict';
	
	var ConfigurationLabContactView = Backbone.View.extend({
		
		model: new ConfigurationLabContact(),
		
		initialize: function(){
			this.listenTo(this.model, 'sync', this.render);
			this.model.fetch();
		},
		
		events:{
			'click #lab-edit' : 'edit',
			'click #lab-save' : 'save',
			'click #lab-reset' : 'reset'
		},
		
		render: function(){
			this.$el.html(template({
				data: this.model.toJSON(),
			}));
			this.labInputs = this.$('.lab-inputs input.reset');
		},
		
		edit: function() {
			this.$('#lab-edit').css('display','none');
			this.$('#lab-save').css('display','inline-block');
			this.labInputs.prop('disabled',false);
				
		},
		
		save: function() {
			this.model.set('name', this.$('#lab-name').val());
			this.model.set('email', this.$('#lab-email').val());
			this.model.set('phone', this.$('#lab-phone').val());
			this.model.save(null,{
							success:function() {
								new BannersView({
									id : 'success-banner',
									container : $('.main-content #lab-messages'),
									style : 'success',
									static : false,
									title : 'Contact Details Updated Successfully'
								}).render();
								$('#lab-save').css('display','none');
								$('#lab-edit').css('display','inline-block');
								this.labInputs.prop('disabled',true);
							}
						});
			
		},
		
		reset: function() {
			this.model.fetch();
		}
		
		
	});
	
	return ConfigurationLabContactView;
});