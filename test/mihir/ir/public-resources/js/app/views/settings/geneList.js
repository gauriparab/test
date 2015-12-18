/* global define:false*/
define([
        'views/ParentView',
        'views/common/baseModalView',
	    'views/common/bannersView',
        'views/settings/addGeneListView',
        'views/settings/geneListGrid',
        'views/settings/geneListFilesGrid',
        'views/common/confirmDeleteModalView',
        'events/eventDispatcher',
        'hb!templates/settings/gene-list.html'],

		function(
				ParentView,
				BaseModalView,
				BannerView,
				AddGeneListView,
				GeneListGrid,
				GeneListFilesGrid,
				ConfirmDeleteModalView,
				Dispatcher,
				template) {

			'use strict';

			var GeneListView = Backbone.View.extend({

				_template : template,
				_gridEl : '#gene-list-grid',
				_detGridEl : '#details-list-grid',

				initialize : function(options) {
					options = options || {};
					var that = this;
					this.canAddGeneList = options.canAddGeneList;
					this.gridView = new GeneListGrid();
					//this.detailsGrid.addFilter('fileId','');
					Dispatcher.on('upload:geneList', this._uploadSuccess, this);
					this.gridView.on('action:view_geneFiles',this._showGeneFiles, this);
					this.gridView.on('action:obsolete',this._obsoleteGeneFile,this);
					this.gridView.on('action:download_file',this._downloadFile,this);
					this.gridView.on('action:delete',this._deleteFile,this);
				},
				
				events: {
					"click a#addGeneList" : "addGeneList"
				},

				delegateEvents : function() {
					Backbone.View.prototype.delegateEvents.apply(this,arguments);
				},

				undelegateEvents : function() {
					Backbone.View.prototype.undelegateEvents.apply(this,arguments);
				},

				render : function() {
					this.$el.html(this._template({
						canAddGeneList:this.canAddGeneList
					}));
					this.gridView.setElement(this.$(this._gridEl)).render();
					//this.detailsGrid.setElement(this.$(this._detGridEl)).render();
				},
				
				addGeneList : function() {
                    BaseModalView.open(null, {
                        type: "add",
                        el: "#addGeneListModal",
                    }, AddGeneListView);
				},
				
				_uploadSuccess:function(){
					var that = this;
					this.gridView.refresh();
				},
				
				_showGeneFiles:function(e, model){
					var that = this;
					this.$('#ctrl').css('display','none');
					this.$('#detail').css('display','block');
					
					this.$('#detail a#goBack').on('click',function(){
						that.$('#detail').css('display','none');
						that.$('#ctrl').css('display','block');
					});
					
					var _model = model.toJSON();
					var id = _model.id;
					$.ajax({
	                    url: '/ir/secure/api/settings/getGenesCustomAttributes?fileId='+model.id,
	                    type: 'GET',
	                    contentType: 'application/json',
	                    dataType: 'json',
	                    success: function(data) {
	                    	if(that.detailsGrid) {
	                    		that.detailsGrid.destroy();
	                    	}
	                    	that.detailsGrid = new GeneListFilesGrid({
	    						customAttributes: data.content,
	    						showTherapyCol: _model.showTherapy
	    					});
	                    	that.detailsGrid._filters.fileId = id;
	                    	that.detailsGrid.setElement(that.$(that._detGridEl)).render();
	                    }
	                });
				},
				
				_obsoleteGeneFile:function(event, model){
					var mode = model.toJSON();
					// 
					$.ajax({
	                    url: '/ir/secure/api/settings/obsoleteGenefile?fileId='+model.id,
	                    type: 'PUT',
	                    contentType: 'application/json',
	                    dataType: 'json',
	                    success: _.bind(this._success, this),
	                });
				},
				
				_downloadFile:function(event, model){
                	var self = this;
                	var id  = model.get("id");
                	$.ajax({
              		    url: '/ir/secure/api/settings/exportGeneFile?fileId='+id,
              		    type: 'GET',
              		    contentType: 'application/json',
            		    success: function(data) {
            		    	window.location = "/ir/secure/api/settings/downloadGenefile?path="+data;
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
				
				_success:function(data){
					Dispatcher.trigger('action:obsolete',{
						id : 'success-banner',
						container : $('.main-content'),
						style : 'success',
						static : false,
						title : 'Gene File Successfully Set to Obsolete.'
					});
					this.gridView.refresh();
				},
				
				_deleteFile : function(e, model) {
					var self = this;
		        	ConfirmDeleteModalView.open(function(){
	        			var geneFileId=model.toJSON().id
	    	        	$.ajax({
	    	        		url: '/ir/secure/api/settings/deleteGeneFile?fileId='+geneFileId,
	    	        		method: 'GET',
	    	        		contentType : 'application/json',
	    	        		success: function(){
	    	        			new BannerView({
	    	                        container: $('.main-content').first(),
	    	                        style: 'success',
	    	                        titleKey: 'geneFile.deleted.successfully'
	    	                    }).render();
	    	                    self.gridView.refresh();
	    	        		}
	    	        	});
		        	}, {
		        		headerKey: 'geneFile.delete.label',
		        		confirmMessageKey: 'geneFile.delete.message',
		        		cancelClass: 'btn-default',
		        		confirmClass: 'btn-primary',
		        	}, ConfirmDeleteModalView);				}
				
			});

			return GeneListView;
		});
