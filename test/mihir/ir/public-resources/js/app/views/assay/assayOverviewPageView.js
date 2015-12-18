/* global define:false*/
define(['views/ParentView',
        'views/assay/assayGridView',
		'views/assay/assayDetailView',
		'views/common/confirmModalView',
		'views/common/confirmDeleteModalView',
		'views/common/searchView',
		'views/common/bannersView',
		'views/common/auditTrailView',
		'views/common/baseModalView',
		'hb!templates/assay/assay-overview-page.html',
		'hb!templates/common/versionFilter.html',
		'views/common/auditReasonView' ].concat('views/common/grid/plugins/multiSelectionGridPlugin'),
	function(ParentView,
			AssayGridView,
			AssayDetailView,
			Confirm,
			ConfirmDeleteModalView,
			SearchView,
			BannerView,
			AuditTrailView,
			BaseModalView,
			template,
			versionFilterTemplate,
			AuditReasonView) {

    'use strict';
	var AssayOverviewPageView = ParentView.extend({

		_template : template,
		_gridEl : '#viewassay-grid',
		_typeFilterEl : '#type-filters',
		_searchEl : '#query-form',
		initialize : function(options) {
			options = options || {};
			this.needsReason = options.auditConfig['Assay'].needsReason;
			this.gridView = new AssayGridView();
			//this.gridView.loadPlugin('multiSelection');
			this.searchView = new SearchView({
				placeHolder: 'assay.name'
			});
			this.gridView.on('action:view_reanalysis',this._showReanalysis, this);
			this.gridView.on('action:reanalysis',this._reanalysis, this);
			this.gridView.on('action:audit_trail', this._onAudit, this);
			this.gridView.on('action:lock', this._lock, this);
			this.gridView.on('action:obsolete', this._Obsolete, this);
			this.gridView.on('action:edit', this._edit, this);
			this.gridView.on('action:view_details',this._viewDetails, this);
			this.gridView.on('action:delete', this._delete, this);
			this.gridView.on('action:export', this._onExport, this);
			this.gridView.on('action:copy', this._onCopy, this);
			this.searchView.on('search', this._onSearch, this);
			this.searchView.on('reset', this._onReset, this);
		},

		delegateEvents : function() {
			Backbone.View.prototype.delegateEvents.apply(this,arguments);
			this.listenTo(this.gridView, 'multiSelect',	this._onMultiSelect);
		},

		undelegateEvents : function() {
			this.stopListening(this.gridView, 'multiSelect',this._onMultiSelect);
			Backbone.View.prototype.undelegateEvents.apply(this, arguments);
		},

		render : function() {
			this.$el.html(this._template({
				canAddAssay : this.options.canAddAssay
			}));
			this.gridView.setElement(this.$(this._gridEl)).render();
			this.searchView.setElement(this.$(this._searchEl)).render();
			if(window.location.hash === '#createSuccess') {
				new BannerView({
					id : 'create-success-banner',
					container : $('.main-content>.container-fluid'),
					style : 'success',
					title : $.t('assay.successfull.creation')
				}).render();
				window.location.hash="";
            } else if (window.location.hash === '#editSuccess') {
            	new BannerView({
					id : 'create-success-banner',
					container : $('.main-content>.container-fluid'),
					style : 'success',
					title : $.t('assay.successfull.edit')
				}).render();
				window.location.hash="";
            }
		},

		_onMultiSelect : function(assays) {
			$('#manageAssayCount').text(assays.length);
			if (assays.length > 0) {
				this.$('#assayExport').removeAttr('disabled');
			} else {
				this.$('#assayExport').attr('disabled','disabled');
			}
		},

		_showReanalysis : function(e, assay) {
			window.location = "reanalysis/details/"	+ assay.get('id');
		},

		_viewDetails : function(e, assay) {
			var self = this;
            BaseModalView.open(null, {
                el: "#viewAssayDetails",
                assayId : assay.toJSON().id
            }, AssayDetailView);
		},

		_lock : function(e, assay) {
			this._changeState(e, assay, 'locked', 'assay.lock.success' , 'confirm.lock.assay.title', 'assay.lock.confirm',this.needsReason);
		},
		_Obsolete : function(e, assay) {
			this._changeState(e, assay, 'Obsolete', 'assay.obsolete.success' ,'confirm.obsolete.assay.title', 'assay.obsolete.confirm',this.needsReason);
		},
		_changeState : function(e, assay ,state ,title , header ,body, _reason ) {
			var self = this;
			Confirm.open(function() {
					var reasonEl = $('#reason-for-change');
					var reason;
					if(reasonEl.length>0){
						reason = reasonEl.val();
					}
					var data={};
					data.id=assay.toJSON().id;
					data.state=state;
					data.reason=reason;
					$.ajax({
						url : '/ir/secure/api/assay/updateAssayState',
						type : 'PUT',
						contentType : 'application/json',
						data: JSON.stringify(data),
						success : function() {
							new BannerView({
								id : 'change-state-success-banner',
								container : $('.main-content>.container-fluid'),
								style : 'success',
								title : $.t(title)
							}).render();
							self.gridView.refresh();
						}
					});
			},{
				headerKey : header,
				bodyKey : body,
				needsReason:_reason
			});
		},
		_onAudit: function(e, assay){
					var data=[];
					var temp={};
					temp.key="audit.trail.assayId";
					temp.value=assay.toJSON().id;
					data.push(temp);
					var self = this;
					BaseModalView.open(null, {
						type: "audit_trail",
						el: "#auditTrailModal",
						model:assay,
						data:data,
						gridViewUrl:'/ir/secure/api/auditmanagement/assay',
						filters:{assayId : assay.toJSON().id},
						detailsViewUrl:'/ir/secure/api/auditmanagement/assay/getAuditDetails' + "?assayId=" + assay.toJSON().id
					}, AuditTrailView);
			    },

		_edit : function(e, assay) {
			window.location.href = "edit-assay/"+ assay.toJSON().id;
		},

		_reanalysis : function(e, assay) {
			window.location.href = "reanalyze/assay/"+ assay.toJSON().id;
		},

		_onSearch : function(query) {
			if (_.isEmpty(query)) {
				this.gridView._filters = {};
				this.gridView.clearFilter("assayName");
			} else {
				this.gridView._filters = {};
				this.gridView.addFilter("assayName", query);
			}
			this.gridView.$el.data('kendoGrid').dataSource.page(1);
		},

		_onReset : function() {
			this.gridView.clearFilter("assayName");
			 var checkboxes = this.gridView.$el.find('tbody tr td :checked');
             _.each(checkboxes, function(checkbox) {
                 $(checkbox).click();
             });
		},

		_delete: function(e, model){
			var self = this;
            ConfirmDeleteModalView.open(function() {
                    var data = {};
                    data.id = model.toJSON().id;
                    var reasonEl = $('#reason-for-change');
					var reason;
					if(reasonEl.length>0) {
						reason = reasonEl.val();
						data.reason = reason;
					}
                    $.ajax({
                        url: '/ir/secure/api/assay/deleteAssay',
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(data),
                        success: function() {
                        	self.gridView.setElement(self.$(self._gridEl)).render();
                        	new BannerView({
								id : 'lock-success-banner',
								container : $('.main-content>.container-fluid'),
								style : 'success',
								title : $.t('assay.delete.success')
							}).render();
                        },
                        error: function(res,status,statusText){
                        	new BannerView({
								id : 'lock-success-banner',
								container : $('.main-content>.container-fluid'),
								style : 'error',
								title : JSON.parse(res.responseText).message
							}).render();
                        }
                    });
            }, {
                headerKey: 'assay.delete.label',
                confirmMessageKey: 'assay.delete.message',
                cancelClass: 'btn-default',
                confirmClass: 'btn-primary',
                needsReason: this.needsReason
            }, ConfirmDeleteModalView);
		},

        _onExport: function(e, model) {
        	var self = this;
        	var assayId = model.assayId
        	$.ajax({
      		    url: "/ir/secure/api/assay/zipFile?assayId="+assayId,
      		    type: "GET",
      		    contentType: "application/json",
    		    success: function(data) {
    		    	window.location = data;
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

        _onCopy: function(e, model){
        	/*var self = this;
            $.ajax({
                url: '/ir/secure/api/assay/copyAssay?id='+model.assayId,
                type: 'GET',
                contentType: 'application/json',
                success: function(){
                     new BannerView({
                         id : 'change-state-success-banner',
                         container : $('.main-content>.container-fluid'),
                         style : 'success',
                         title : 'Assay copied successfully.'
                    }).render();
                    self.gridView.refresh();
                }
            });*/
        	window.location.href = "copy-assay/"+ model.toJSON().id;
        }

	});

	return AssayOverviewPageView;
});
