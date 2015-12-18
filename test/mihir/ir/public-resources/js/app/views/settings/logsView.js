/* global define:false*/
define([
        'views/ParentView',
        'views/settings/logsGridView',
        'views/common/baseModalView',
        'views/common/bannersView',
        'views/settings/manageLogsView',
	'views/common/confirmDeleteModalView',
        'events/eventDispatcher',
        'hb!templates/settings/logs-view.html'
        ],

		function(
				ParentView,
				LogsGridView,
				BaseModalView,
				BannersView,
				ManageLogsView,
				ConfirmDeleteModalView,
				Dispatcher,
				template) {

			'use strict';

			var LogsView = ParentView.extend({

				_template : template,
				_gridEl : '#log-manage-grid',

				initialize : function(options) {
					this.gridView = new LogsGridView();
					this.gridView.addFilter('applicationlogs','true');
					Dispatcher.on('update:logs',this._logUpdate,this);
					
					this.gridView.on('action:view-log-file', this._onShowFile, this);
					this.gridView.on('action:delete', this._onDelete, this);
					
				},
				
				events: {
					'click a#log-manage':'_onManageLogs'
				},

				delegateEvents : function() {
					Backbone.View.prototype.delegateEvents.apply(this,arguments);
				},

				undelegateEvents : function() {
					Backbone.View.prototype.undelegateEvents.apply(this,arguments);
				},

				render : function() {
					var that = this;
					this.$el.html(this._template({}));
					this.gridView.setElement(this.$(this._gridEl)).render();
					this.$('#logs-list').on('change',function(){
						that.gridView.addFilter('applicationlogs',that.$(this).val().toString());
						//that.gridView.refresh();
					});
				},
				_onManageLogs: function(){
					var that = this;
                    BaseModalView.open(null, {
                        type: "edit",
                        el: "#manage-logs-modal",
                    }, ManageLogsView);
				},
				_logUpdate: function(data){
					var message = data?'Log Settings Updated Successfully':'Failed to update log settings';
					new BannersView({
						container : $('.main-content'),
						style : data? 'success':'error',
						static : false,
						title : message
					}).render();
				},
				_onShowFile: function(e, model){
					var _model = model.toJSON();
					var url = '/ir/secure/api/settings/logs/showLogFile?logFileName='+_model.logFileName;
					
					var win = window.open(url, '_blank');
				},
				_onDelete: function(e, model){
					var self = this;
					ConfirmDeleteModalView.open(function() {
						$.ajax({
                        				url: '/ir/secure/api/settings/logs/deleteLogFile?fileName='+model.toJSON().logFileName,
                        				method: 'DELETE',
                        				contentType: 'application/json',
                        				success: function() {
                        					self.gridView.setElement(self.$(self._gridEl)).render();
                        					new BannerView({
									id : 'delete-success-banner',
									container : $('.main-content>.container-fluid'),
									style : 'success',
									title : $.t('log.delete.success')
								}).render();
                        				},
                        				error: function(res,status,statusText){
                        					new BannerView({
									id : 'delete-success-banner',
									container : $('.main-content>.container-fluid'),
									style : 'error',
									title : JSON.parse(res.responseText).message
								}).render();
                        				}
                    				});
					}, {
                				headerKey: 'log.delete.label',
                				confirmMessageKey: 'logs.delete.message',
                				cancelClass: 'btn-default',
                				confirmClass: 'btn-primary',
                				needsReason: this.needsReason
            				}, ConfirmDeleteModalView);
				},
					
			});
			return LogsView;
		});
