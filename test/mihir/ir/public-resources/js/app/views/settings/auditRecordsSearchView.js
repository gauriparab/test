/* global define:false*/
define([
        'models/settings/auditConfiguration',
        'models/settings/userList',
        'views/ParentView',
        'events/eventDispatcher',
        'hb!templates/settings/audit-records-search-view.html'].concat('bootstrap.datepicker'),

		function(
				DataObjects,
				UserList,
				ParentView,
				Dispatcher,
				template) {

			'use strict';

			var AuditRecordsSearchView = ParentView.extend({

				_template : template,

				initialize : function(options) {
					var that = this;
					this.dataObjects = null;
					this.userObject = null;
					this.dataObjectModel = new DataObjects();
					this.userListModel = new UserList();
					this.dataObjectModel.fetch({
						success:function(){
							that.dataObjects = that.dataObjectModel.toJSON();
							that.userListModel.fetch({
								success:function(){
									that.userObject = that.userListModel.toJSON();
									that.render();
								}
							});
						}
					});
				},

				events: {
					'click #add-filter': '_setFilter',
					'click #clear_filter':'_resetFilter',
					'click button#records-export' : '_onExport'
				},

				delegateEvents : function() {
					Backbone.View.prototype.delegateEvents.apply(this,
							arguments);
				},

				undelegateEvents : function() {
					Backbone.View.prototype.undelegateEvents.apply(this,
							arguments);
				},

				render : function() {
					if(this.userObject){
						this.$el.html(this._template({
							dataObjects:this.dataObjects,
							userObjects:this.userObject
						}));
						this.$('.input-append.date').datepicker({
			                endDate: "today",
			                orientation: "top auto",
			                todayHighlight: true,
			                autoclose: true,
			                format: "yyyy-mm-dd"
			            });
					}
				},
				_setFilter:function(){
					Dispatcher.trigger('filter:added',{
						filter1: this.$('#start-date').val() || '',
						filter2: this.$('#end-date').val() || '',
						filter3: this.$('#audit-user').val() || '',
						filter4: this.$('#audit-action').val() || '',
						filter5: this.$('#audit-data-object-type').val() || ''
					});
				},
				_resetFilter: function(){
					var that = this;
					this.$('.audit-records-search input').val('');
					this.$('.audit-records-search select').each(function(){
						that.$(this).val($(this).find('option:first-child').val());
					})
					Dispatcher.trigger('filter:added',{
						filter1: '',
						filter2: '',
						filter3: '',
						filter4: '',
						filter5: ''
					});
				}
			});

			return AuditRecordsSearchView;
		});
