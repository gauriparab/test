/* global define:false*/
define([
        'jquery',
        'underscore',
        'backbone',
        'views/common/baseModalView',
        'views/settings/addHotspotView',
        'views/settings/hotspotsGrid',
        'events/eventDispatcher',
        'hb!templates/settings/hotspots.html',
        'models/importReferences'
        ],
function(
		$,
		_,
		Backbone,
		BaseModalView,
		AddHotspotView,
		HotspotsGrid,
		Dispatcher,
		template,
		ImportReferences) {
			'use strict';

			var HotspotsView = Backbone.View.extend({

				_template : template,
				_gridEl : '#hotspots-grid',

				initialize : function(options) {
					options = options || {};
					this.gridView = new HotspotsGrid();
					this.referencesModel = new ImportReferences();
					Dispatcher.on('upload:hotspot', this._uploadSuccess, this);
					this.gridView.on('action:obsolete', this._onMakeObsolete, this);
					this.gridView.on('action:reactivate',this._onReactivate,this);
					this.gridView.on('action:export',this._downloadFile,this);
				},
				
				events: {
					"click a#addHotspot" : "addHotspot"
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
					this.$el.html(this._template());
					this.gridView.setElement(this.$(this._gridEl)).render();
				},
				
				addHotspot : function() {
					var that = this;
					this.referencesModel.fetch({
						success:function(){
							new AddHotspotView({
								grid: that.gridView,
								references:that.referencesModel.toJSON()
							}).render();
						}
					});
				},
				_uploadSuccess:function(){
					var that = this;
					setTimeout(function() {
						that.gridView.refresh();
					}, 5000);
				},
				_onMakeObsolete:function(e, model){
					var that = this;
					var _model = model.toJSON();
					$.ajax({
	                    url: '/ir/secure/api/settings/obsoleteHotspot?fileId='+_model.id,
	                    type: 'PUT',
	                    contentType: 'application/json',
	                    dataType: 'json',
	                    success: _.bind(that._onObsoleteSuccess, that),
	                    error: _.bind(that._onObsoleteError, that)
	                });
				},
				_onObsoleteSuccess:function(e,model){
					Dispatcher.trigger('action:obsolete',{
						id : 'success-banner',
						container : $('.main-content'),
						style : 'success',
						static : false,
						title : $.t('settings.hotspot.obsolete.success')
					});
					this.gridView.refresh();
				},
				
				_onObsoleteError:function(e,model){
					
					var message = "";
					
					if(e.status === 500){
						var x = JSON.parse(e.responseText);
						message = x.message;
					} else{
						message = e.statusText
					}
					
					Dispatcher.trigger('action:obsolete',{
						id : 'error-banner',
						container : $('.main-content'),
						style : 'error',
						static : false,
						title : message
					});
				},
				
				_onReactivate: function(e, model){
					var that = this;
					var _model = model.toJSON();
					$.ajax({
	                    url: '/ir/secure/api/settings/ReactivateHotspots?fileId='+_model.id,
	                    type: 'PUT',
	                    contentType: 'application/json',
	                    dataType: 'json',
	                    success: _.bind(that._onReactivateSuccess, that),
	                    error: _.bind(that._onReactivateError, that)
	                });
				},
				
				_onReactivateSuccess: function(){
					Dispatcher.trigger('action:obsolete',{
						id : 'success-banner',
						container : $('.main-content'),
						style : 'success',
						static : false,
						title : $.t('settings.hotspot.reactivate.success')
					});
					this.gridView.refresh();
				},
				
				_onReactivateError: function(){
					var message = "";
					
					if(e.status === 500){
						var x = JSON.parse(e.responseText);
						message = x.message;
					} else{
						message = e.statusText
					}
					
					Dispatcher.trigger('action:obsolete',{
						id : 'error-banner',
						container : $('.main-content'),
						style : 'error',
						static : false,
						title : message
					});
				},
				
				_downloadFile:function(event, model){
                	var self = this;
                	var id  = model.get("irFileId");
                	$.ajax({
              		    url: '/ir/secure/api/settings/exportPanel?fileId='+id,
              		    type: 'GET',
              		    contentType: 'application/json',
            		    success: function(data) {
            		    	window.location = "/ir/secure/api/settings/downloadBedfile?path="+data;
            		    },
                		error: function(resp) {
		        			var error = JSON.parse(resp.responseText);
		                    if (error && error.status < 500) {
		                        //jshint nonew:false
		                        new BannerView({
		                            container: $('.modal-body'),
		                            style: 'error',
		                            title: error.message,
		                            messages: error.errors && error.errors.allErrors &&
		                                _.pluck(error.errors.allErrors, 'defaultMessage')
		                        }).render();
		                    }
                		}
            		});		
				}
			});

			return HotspotsView;
		});
