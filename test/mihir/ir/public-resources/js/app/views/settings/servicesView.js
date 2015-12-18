/* global define:false*/
define([
        'views/ParentView',
        'views/common/confirmModalView',
        'views/common/bannersView',
        'views/settings/jobServerView',
        'views/settings/serviceSubView',
        'views/settings/activeJobsView',
        'views/settings/crawlerServiceView',
        'views/settings/rsmServiceView',
        'hb!templates/settings/services-view.html'
        ],

		function(
				ParentView,
				ConfirmView,
				BannerView,
				JobServerView,
				ServiceSubView,
				ActiveJobsView,
				CrawlerServiceView,
				RsmServiceView,
				template
				) {

			'use strict';

			var ServicesView = ParentView.extend({

				_template : template,
				_serverEl : '#jobs-server',
				_serviceEl : '#jobs-service',
				_activeEl : '#jobs-active',
				_crawlerEl : '#crawler-service',
				_rsmEl : '#rsm-service',

				initialize : function(options) {
					this.userRole= options.userRole;

					this.jobServerView = new JobServerView();
					this.serviceSubView = new ServiceSubView({
						userRole: this.userRole
					});
					this.activeJobsView = new ActiveJobsView();
					this.crawlerServiceView = new CrawlerServiceView();
					this.rsmServiceView = new RsmServiceView();
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
					this.renderSubView(this.jobServerView, this._serverEl);
					this.renderSubView(this.serviceSubView, this._serviceEl);
					this.renderSubView(this.activeJobsView, this._activeEl);
					this.renderSubView(this.crawlerServiceView, this._crawlerEl);
					this.renderSubView(this.rsmServiceView, this._rsmEl);
				}
			});
			return ServicesView;
		});
