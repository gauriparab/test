/* global define:false*/
define([
        'views/ParentView',
        'views/common/baseModalView',
	    'views/common/bannersView',
        'views/settings/addFusionReferenceView',
        'views/settings/fusionReferenceGrid',
        'events/eventDispatcher',
        'hb!templates/settings/fusion-reference.html'],

		function(
				ParentView,
				BaseModalView,
				BannersView,
				AddFusionReferenceView,
				FusionReferenceGrid,
				Dispatcher,
				template) {

			'use strict';

			var PanelsView = Backbone.View.extend({

				_template : template,
				_gridEl : '#fusion-reference-grid',

				initialize : function(options) {
					options = options || {};
					this.gridView = new FusionReferenceGrid();
					var that = this;
					Dispatcher.on('upload:fusion-reference', this._uploadSuccess, this);
					this.gridView.on('action:export',this._export,this);
					this.gridView.on('action:obsolete', this._onMakeObsolete, this);
					this.gridView.on('action:reactivate',this._onReactivate,this);
				},
				
				events: {
					"click a#addFusionReference" : "addFusionReference"
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
					this.$el.html(this._template({
						canAddFusionReference: this.options.canAddFusionReference
					}));
					this.gridView.setElement(this.$(this._gridEl)).render();
				},
				
				addFusionReference : function() {
                    BaseModalView.open(null, {
                        type: "add",
                        el: "#addFusionReferenceModal"
                    }, AddFusionReferenceView);
				},
				
				_uploadSuccess:function(){
					this.gridView.refresh();
				},
				
				_export: function(e,model){
					console.log(model);
					var self = this;
                	var id  = model.get("irFileId");
                	$.ajax({
              		    url: '/ir/secure/api/settings/exportFusionReference?fileId='+id,
              		    type: 'GET',
              		    contentType: 'application/json',
            		    success: function(data) {
            		    	window.location = "/ir/secure/api/settings/downloadFastafile?path="+data;
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
				},
				
				_onMakeObsolete:function(e, model){
					var that = this;
					var _model = model.toJSON();
					$.ajax({
	                    url: '/ir/secure/api/settings/obsoleteFusionReference?fileId='+_model.id,
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
						title : 'Fusion Reference Successfully Set to Obsolete'
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
	                    url: '/ir/secure/api/settings/reactivateFusionReference?fileId='+_model.id,
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
						title : $.t('settings.fusionreference.reactivate.success')
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
				
			});

			return PanelsView;
		});
