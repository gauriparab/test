define([
        'models/settings/softwareVersions',
        'views/ParentView',
        'views/common/bannersView',
        'views/settings/softwareUpdatesView',
        'events/eventDispatcher',
        'hb!templates/settings/configuration-software-view.html',
        'hb!templates/common/spinner.html'
        ],

		function(
				SoftwareVersions,
				ParentView,
				BannersView,
				SoftwareUpdatesView,
				Dispatcher,
				template,
				Spinner) {

			'use strict';

			var ConfigurationSoftwareView = ParentView.extend({

				_template : template,
				_updatesEl: '#showUpdates',
				
				initialize : function(options) {
					this.isAssayDev=options.isAssayDev;
					var that = this;
					this.softwareDetails = null;
					this.softwareModel = new SoftwareVersions();
					this.softwareUpdatesView = new SoftwareUpdatesView();
					Dispatcher.on('view:updateButton',this._viewUpdateButton,this);
				},
				
				events: {
					'click #checkForUpdates': '_checkForUpdates',
					'click #installUpdates': '_installUpdates'
				},

				delegateEvents : function() {
					Backbone.View.prototype.delegateEvents.apply(this, arguments);
				},

				undelegateEvents : function() {
					Backbone.View.prototype.undelegateEvents.apply(this, arguments);
				},

				render : function() {
					var that = this;
					this.$el.html(Spinner());
					this.softwareModel.fetch({
						success:function(){
							that.$el.html(that._template({dets:that.softwareModel.toJSON()}));
						}
					});
				},
				
				_checkForUpdates: function(){
					var that = this;
					this.softwareUpdatesView.setElement(this.$(this._updatesEl)).render();
				},
				
				_viewUpdateButton: function(state){
					$('#installUpdates').css('display','inline-block');
					$('#installUpdates').prop('disabled',state);
				},
				
				_installUpdates: function(){
					var that = this;
					$('#installUpdates').prop('disabled',true);
					$.ajax({
						url:'/ir/secure/api/settings/install',
						type : 'GET',
						contentType : 'application/json',
						success: function(req,res){
						},
						error:function(req,res){
							console.log('Error');
						}
					});
					setTimeout( function() {
						if(that.isAssayDev){
							window.location='/updateProgressWar-1.0/showUpdate.jsp';
						}else {
							window.location='/updateProgressWar-1.0/showUpdateDx.jsp';
						}
					},3000);
					
				}
			});
			return ConfigurationSoftwareView;
		});
