/* global define:false*/
define([
        'views/ParentView',
        'views/common/baseModalView',
        'views/common/bannersView',
        'views/settings/configurationNetworkSettingsView',
        'views/settings/configurationEmailSettingsView',
        'views/settings/configurationInstrumentsView',
        'views/settings/configurationLabInfoView',
        'views/settings/configurationSoftwareView',
        'views/settings/changeAppModeView',
        'hb!templates/settings/configuration-view.html'
        ],

		function(
				ParentView,
				BaseModalView,
				BannersView,
				ConfigurationNetworkSettingsView,
				ConfigurationEmailSettingsView,
				ConfigurationInstrumentsView,
				ConfigurationLabInfoView,
				ConfigurationSoftwareView,
				ChangeAppModeView,
				template) {

			'use strict';

			var ConfigurationView = ParentView.extend({

				_template : template,
				_networkEl : '#network',
				_emailEl : '#email',
				_instrumentsEl : '#instruments',
				_labEl : '#lab',
				_software : '#software',

				initialize : function(options) {
					this.isAssayDev=options.isAssayDev;
					this.networkSettingsView = {};
					this.emailSettingsView = {};
					this.instrumentsView = {};
					this.labInfoView = {};
					this.softwareView = {};
					if(options.auditConfig && options.auditConfig['System Setup']){
		            	this.needsReason = options.auditConfig['System Setup'].needsReason;
		            } else{
		            	this.needsReason=false;
		            }
				},
				
				events: {
					'click #change-mode' : '_changeAppMode'
				},

				delegateEvents : function() {
					Backbone.View.prototype.delegateEvents.apply(this, arguments);
				},

				undelegateEvents : function() {
					Backbone.View.prototype.undelegateEvents.apply(this, arguments);
				},

				render : function() {
					var that = this;
					this.$el.html(this._template({}));
					
					this.$('a[data-toggle="tab"]').on('shown', function (e) {
						var target = e.target;
						var messages = that.$(target).data('messages');
						var _for = that.$(target).data('for');
						that.$('#messages div').css('display','none');
						switch(_for){
							case 'network':{
								that.networkSettingsView = new ConfigurationNetworkSettingsView({
									needsReason: that.needsReason
								});
								that.$('#messages #network-messages').css('display','block');
								that.renderSubView(that.networkSettingsView, that._networkEl);
							}break;
							
							case 'email':{
								that.emailSettingsView = new ConfigurationEmailSettingsView();
								that.$('#messages #email-messages').css('display','block');
								that.renderSubView(that.emailSettingsView, that._emailEl);
							}break;
							
							case 'instruments':{
								that.instrumentsView = new ConfigurationInstrumentsView();
								that.$('#messages #instruments-messages').css('display','block');
								that.renderSubView(that.instrumentsView, that._instrumentsEl);
							}break;
							
							case 'lab':{
								that.labInfoView = new ConfigurationLabInfoView();
								that.$('#messages #lab-messages').css('display','block');
								that.renderSubView(that.labInfoView, that._labEl);
							}break;
							
							case 'software':{
								that.softwareView = new ConfigurationSoftwareView({
									isAssayDev:that.isAssayDev
								});
								that.$('#messages #software-messages').css('display','block');
								that.renderSubView(that.softwareView, that._software);
							}break;
						}
					});
					
					$('#config-tabs a#tab-network').tab('show');
				},
				_changeAppMode: function(){
					var that = this;
                    BaseModalView.open(null, {
                        type: "edit",
                        el: "#changeAppMode",
                    }, ChangeAppModeView);
				}
			});
			return ConfigurationView;
		});
