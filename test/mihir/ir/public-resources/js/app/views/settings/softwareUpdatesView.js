define([
        'views/ParentView',
        'views/common/bannersView',
        'views/common/confirmModalView',
        'models/settings/softwareUpdates',
        'events/eventDispatcher',
        'hb!templates/settings/software-updates-view.html',
        'hb!templates/common/spinner.html'
        ],

		function(
				ParentView,
				BannerView,
				Confirm,
				SoftwareUpdates,
				Dispatcher,
				template,
				Spinner) {

			'use strict';

			var SoftwareUpdateView = ParentView.extend({

				_template : template,
				events:{
					'click a.terminator':'_terminate'
				},
				
				initialize : function(options) {
					var that = this;
					this.model = new SoftwareUpdates();
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
					this.model.fetch({
						success:function(){
							var data = that.model.toJSON();
							Dispatcher.trigger('view:updateButton',!data.updateButtonEnable);
							that.$el.html(template({
								data:data
							}));
							that._bindEvents();
						}
					});
				},
				
				_bindEvents:function(){
					var that = this;
					$('a.terminator').on('click',function(e){
						console.log($(e.currentTarget));
						that._terminate($(e.currentTarget));
					});
				},
				
				_terminate: function(el){
					var that = this;
					var id = el.data('id');
					var parentTr = el.parents('tr');
					
					var success = 'settings.softwareUpdates.terminateAnalysis.success';
					var header  =  'settings.softwareUpdates.terminateAnalysis.title';
					var body    = 'settings.softwareUpdates.terminateAnalysis.message';
					this._confirmTerminate(id, success, header, body);
					
				},
				
				_confirmTerminate : function(id ,success, header ,body) {
					var that = this;
					Confirm.open(function() {
						$.ajax({
							url : '/ir/secure/api/settings/termincateAnalysis?id='+id,
							type : 'GET',
							contentType : 'application/json',
							success : function() {
								new BannerView({
									id : 'change-state-success-banner',
									container : $('.main-content'),
									style : 'success',
									title : $.t(success)
								}).render();
								that.render();
							},
							error: function(res){
								var err = JSON.parse(res.responseText).message;
								new BannerView({
									id : 'change-state-success-banner',
									container : $('.main-content'),
									style : 'error',
									title : err
								}).render();
							}
							});
					},{
						headerKey : header,
						bodyKey : body,
						needsReason:false
					});
				},
			});
			return SoftwareUpdateView;
		});
