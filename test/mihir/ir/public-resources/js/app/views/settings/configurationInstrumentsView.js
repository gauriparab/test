/* global define:false*/
define([
        'models/settings/instrumentsList',
        'views/common/bannersView',
        'views/ParentView',
        'views/common/baseModalView',
        'views/common/auditTrailView',
        'hb!templates/settings/configuration-instruments-view.html'
        ],

		function(
				InstrumentsList,
				BannersView,
				ParentView,
				BaseModalView,
				AuditTrailView,
				template) {

			'use strict';

			var ConfigurationInstrumentsView = ParentView.extend({

				_template : template,
				
				_settings:{},
				
				initialize : function(options) {
					var that = this;
					this.instruments = null;
					this.data = {};
					this.selected = 0;
					this.instrumentsModel = new InstrumentsList();
					
					this.instrumentsModel.fetch({
						success:function(req,res){
							that.isDone = true;
							that.instruments = that.instrumentsModel.toJSON();
							that._loadDetails(0);
						}
					});
				},
				
				events: {},

				delegateEvents : function() {
					Backbone.View.prototype.delegateEvents.apply(this, arguments);
				},

				undelegateEvents : function() {
					Backbone.View.prototype.undelegateEvents.apply(this, arguments);
				},

				render : function() {
					var that = this;
					this.$el.html(this._template({
						list:this.instruments,
						details:this.data
					}));
					this.$('#instruments-list').val(this.selected)
					this.$('#instruments-list').on('change',function(){
						var id = that.$(this).val();
						that.selected = id;
						that._loadDetails(id);
					});					
				},
				
				_loadDetails: function(id){
					this.$('#instruments-list').val(id);
					if(this.instruments){
						this.data = this.instruments[id].details;
						this.render();
					}
				}
				
			});
			return ConfigurationInstrumentsView;
		});
