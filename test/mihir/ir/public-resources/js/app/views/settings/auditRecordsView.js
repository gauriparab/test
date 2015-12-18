/* global define:false*/
define([
        'models/common/genericModel',
        'views/ParentView',
        'views/common/baseModalView',
        'views/common/bannersView',
        'views/settings/auditRecordsSearchView',
        'views/settings/auditRecordsGridView',
        'views/settings/auditConfigurationModalView',
        'views/settings/auditRecordsDetails',
        'views/common/auditTrailDetailsView',
        'events/eventDispatcher',
        'hb!templates/settings/audit-records-view.html',
        ],

		function(
				GenericModel,
				ParentView,
				BaseModalView,
				BannerView,
				AuditRecordsSearchView,
				AuditRecordsGridView,
				AuditConfigurationModalView,
				AuditRecordsDetails,
				AuditTrailDetailsView,
				Dispatcher,
				template) {

			'use strict';

			var AuditSearchView = ParentView.extend({

				_template : template,
				_searchEl : '#search-region',
				_gridEl	  : '#audit-records-grid-view',

				initialize : function(options) {
					var that = this;
					Dispatcher.on('update:auditConfiguration', this._updateSuccess, this);
					Dispatcher.on('filter:added', this._addFilter, this);
					this.searchView = new AuditRecordsSearchView();
					this.gridView = new AuditRecordsGridView();

					this.gridView.on('multiSelect', this._onGridMultiSelect, this);
					this.gridView.on('action:audit_view_details',this._showRecord, this);

					this.gridView.addFilter('startDate','');
					this.gridView.addFilter('endDate','');
					this.gridView.addFilter('user','');
					this.gridView.addFilter('actionPerformed','');
					this.gridView.addFilter('dataObjectName','');
					this.gridView.addFilter('plannedrun','');

				},

				events: {
					'click a#audit-config' : 'openAuditConfigurationModal',
					'click button#records-print' : '_onPrint',
					'click #records-export': '_onExport'
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
					this.$el.html(this._template({}));
					this.searchView.setElement(this.$(this._searchEl)).render();
					this.gridView.setElement(this.$(this._gridEl)).render();
					$('.input-append.date').datepicker({
		                endDate: "today",
		                orientation: "top auto",
		                todayHighlight: true,
		                autoclose: true,
		                format: "yyyy-mm-dd"
		            });
				},
				openAuditConfigurationModal: function(){
					BaseModalView.open(null, {
                        type: "add",
                        el: "#audit-configuration-modal",

                    }, AuditConfigurationModalView);
				},
				_updateSuccess:function(data){
					new BannerView(data).render();
				},
				_showRecord:function(e, data){
					var attr = data.toJSON();
					var url = this._urlBuilder(attr);

					BaseModalView.open(null, {
						type: "view_details",
						el: "#audit-details-modal",
						model:data,
						detailsViewUrl:url[0]
					}, AuditTrailDetailsView);
				},

				_onGridMultiSelect:function(records){
					this.$('#selectedRecordsCount').html(records.length);
					if(records.length>0){
						this.$('#bulk-actions button').prop('disabled',false);
					} else{
						this.$('#bulk-actions button').prop('disabled', true);
					}
				},

				_onPrint:function(){

					/*var that = this;
					var records = this.gridView.getSelected();
					if (records.length === parseInt(0)) {
                        alert('Please select at least one Specimen.');
                        return false;
                    }
					var len = records.length;
					var urls = this._urlBuilder(records);
					var check = ((len*(len+1))/2);
					var total = 0;
					var result = [];

					for(var i=0;i<urls.length;i++){
						(function(i){
							var url = urls[i];
							var model = new GenericModel({url:url});

							model.fetch({
								success:function(){
									total+=(i+1);
									result.push(model.toJSON());
									if(total === check){
										that._goPrint(result);
									}
								}
							});
						})(i);
					}*/
				},

				_goPrint: function(data){
					console.log(data);
				},

				_urlBuilder:function(object){
					var arr = [];
					var result = [];

					if(isNaN(object.length)){
						arr.push(object);
					} else{
						for(var i=0;i<object.length;i++){
							arr.push(object.models[i].attributes);
						}
					}

					for(var i=0;i<arr.length;i++){
						var url = '/ir/secure/api/auditmanagement/';
						var segment = '/getAuditDetails?';

						var dON = arr[i].dataObjectName.toLowerCase().replace(/ +/g, "");
						var dONId = dON+'Id='+arr[i].entityId;
						var revId = '&revId='+arr[i].revId;
						var actionType = '&actionType='+arr[i].actionPerformed;

						url+=dON;
						url+=segment;
						url+=dONId;
						url+=revId;
						url+=actionType;

						result.push(url);
					}

					return result;
				},

				_addFilter:function(obj){
					this.gridView.addFilter('startDate',obj.filter1);
					this.gridView.addFilter('endDate',obj.filter2);
					this.gridView.addFilter('user',obj.filter3);
					this.gridView.addFilter('actionPerformed',obj.filter4);
					this.gridView.addFilter('dataObjectName',obj.filter5);
					this.gridView.addFilter('plannedrun',obj.filter5);
					this._goToFirstPage();
				},
				
				_goToFirstPage: function(){
					this.gridView.$el.data('kendoGrid').pager.page(1);
				},

				_onExport: function() {
                	var self = this;
                	var list=[]
                	_.each(self.gridView.getSelected().toJSON(), function(record){
                		var auditRecord={};
                		auditRecord.revId=record.revId;
                		auditRecord.entityId=record.entityId;
                		auditRecord.dataObjectName=record.dataObjectName;
                		auditRecord.actionPerformed=record.actionPerformed;
                		list.push(auditRecord);
                	});
                	$.ajax({
              		    url: '/ir/secure/api/auditableObject/getAuditableObjectListPDF',
              		    type: 'POST',
            		    data: JSON.stringify(list),
              		    contentType: 'application/json',
            		    success: function(data) {
            		    	window.location = "/ir/secure/api/auditableObject/downloadAuditPDF?path="+data;
            		    }
            		});

                }

			});
			return AuditSearchView;
		});
