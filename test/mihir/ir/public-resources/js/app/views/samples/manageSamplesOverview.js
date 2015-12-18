/*global define:false*/
define([ 'jquery', 'underscore', 'backbone', 'views/samples/manageSamplesGridView', 'views/samples/manageSampleDetailsView','views/samples/editSampleView', 'views/samples/sampleSearchView', 'views/common/confirmModalView', 'views/common/bannersView', 'views/samples/confirmDeleteSamplesModalView', 'views/samples/batchSamplesDetailsView', 'collections/sample/batchSpecimens', 'models/batchresult/BatchResult', 'views/common/dialog', 'views/loadingView', 'hb!templates/sample/manage-samples-overview.html', 'views/common/baseModalView', 'views/samples/manageSampleAddView', 'views/samples/auditTrailView', 'views/samples/planARunView', 'collections/sampleAttributes', 'models/sample/sampleModel'].concat('bootstrap'),
    function($, _, Backbone, ManageSamplesGridView, ManageSampleDetailsView,EditSampleView , SearchViewNew, Confirm, BannerView, ConfirmDeleteSamples, BatchSamplesDetailsView, BatchSpecimens, BatchResult, Dialog, LoadingView, template, BaseModalView, ManageSampleAddView, AuditTrailView, PlanARunView, SampleAttributes, Sample) {
        'use strict';

        /**
         * Sample overview page
         *
         * @type {*}
         */
        var manageSamplesOverview = Backbone.View.extend({

            _template: template,

            _gridEl: '#viewsamples-grid',
            _searchEl: '#query-form',
            _filterEl: '#flag-filters',
            _actionsEl: '#details-options-menu',
            _batchActionsEl: '#batch-details-options-menu',

            initialize: function(options) {
                options = options || {};

                this._totalSaved = options.totalSaved;
                this._totalInvalid = options.totalInvalid;
                this._importInitiated = options.importInitiated;
		this.sampleAttributes = new SampleAttributes();

                this.searchView = new SearchViewNew();
                this.searchView.on('search', this._onSearch, this);
            },
            events: {
		'change #filterCondition': 'onFilterChange',
                'click #manageSampleAddBtn': '_onOpenAddSample',
                'click #manageSampleExport': '_onExport',
                'click #manageSamplePrint' : '_onPrint',	
                'click #manageSampleDelete' : '_onDelete',
                'click #manageSamplePlanARunBtn' : '_onPlanARun',
		'click button#gridReset': '_onReset'
            },

            render: function() {
                this.$el.html(this._template({defineActions : this.options.defineActions }));
		var self = this;
                $.when(this.sampleAttributes.fetch()).done(function() {
                    self.gridView = new ManageSamplesGridView({
                         sampleAttributes: self.sampleAttributes
                    });
                    self.gridView.on('multiSelect', self._onGridMultiSelect, self);
		    self.gridView.on('action:edit', self._onEdit, self);
                    self.gridView.on('action:audit_trail', self._onAudit, self);
		    self.gridView.setElement(self.$(self._gridEl)).render();
		    $("[data-toggle='tooltip']").tooltip();
                });
                this.searchView.setElement(this.$(this._searchEl)).render();
            },

	    _onAudit: function(e, sample){
                 var auditTrail = new AuditTrailView({
                     data: sample.toJSON()
                 });
                 auditTrail.render();
	    },

            get: function(name) {
                return _.has(this, name) && this[name] || null;
            },

            _onGridMultiSelect: function(samples) {
                $("#manageSampleCount").html(samples.length);
                if (samples.length > 0) {
                    this.$('#manageSamplePrint').removeAttr('disabled');
                    this.$('#manageSampleDelete').removeAttr('disabled');
                    this.$('#manageSampleExport').removeAttr('disabled');
                    this.$('#manageSamplePlanARunBtn').removeAttr('disabled');
                } else {
                    this.$('#manageSamplePrint').attr('disabled', 'disabled');
                    this.$('#manageSampleDelete').attr('disabled', 'disabled');
                    this.$('#manageSampleExport').attr('disabled', 'disabled');
                    this.$('#manageSamplePlanARunBtn').attr('disabled', 'disabled');
                }
            },

            _onSearch: function(query) {
                if (_.isEmpty(query)) {
                    this.gridView._filters = {};
                } else {
                    if(query.length){
                        this.gridView._filters = {};
                        for(var i=0; i<query.length; i++){
                            this.gridView.addFilter(query[i].substring(0,query[i].indexOf("=")), query[i].substring(query[i].indexOf("=")+1));  
                        }
                    }
                }
            },
            

            _onFilter: function(filter) {
                if (_.isEmpty(filter)) {
                    this.gridView.clearFilter('flag');
                } else {
                    this.gridView.addFilter('flag', filter);
                }
            },

            _onDelete: function() {
                var samples = this.gridView.getSelected().toJSON();
                var canDelete = _.filter(samples, function(sample) { return sample.isEditable;});
                var cantDelete = _.difference(samples, canDelete);
				var options = {};
				if(canDelete && canDelete.length > 0) {
				    options.canDelete = canDelete;
				}
				if(cantDelete && cantDelete.length > 0) {
                    options.cantDelete = cantDelete;
                }
                var self = this;
                Confirm.open(function() {
                    var ids = [];
                    for(var i = 0, len = canDelete.length; i<len; i++){
                        ids.push(canDelete[i].id);
                    }
                    if(!canDelete || canDelete.length === 0){
                    	new BannerView({
                            id: 'success-banner',
                            container: $('.main-content>.container-fluid'),
                            style: 'error',
                            title: $.t('sample.delete.nosamples')
                        }).render();
		     		             	
                    } else{
	                    $.ajax({
		                 	url: '/ir/secure/api/samplemanagement/samples/deleteSample',
		                 	type: 'POST',
		                 	contentType: 'application/json',
		                 	data: JSON.stringify(ids),
		                 	success: function() {
	                 		new BannerView({
	                                id: 'success-banner',
	                                container: $('.main-content>.container-fluid'),
	                                style: 'success',
	                                title: $.t('sample.delete.success')
	                            }).render();
				     		
		                 	    self.gridView.refresh();
		                 	    self.gridView.$el.find('thead tr th:first-child :checkbox').click();
	                    	}
	                    });
                    }
                }, options, ConfirmDeleteSamples);
            },    
          
            
            delegateEvents: function() {
                Backbone.View.prototype.delegateEvents.apply(this, arguments);
            },
            
            _onEdit: function(e, sample) {
		this.editSampleView = new EditSampleView({
                    model: sample,
                    grid: this.gridView
                });
                this.editSampleView.render();
            },
            
	    _onPrint: function() {
		var samples = this.gridView.getSelected();
	      var html = "<h3> Sample Details <h3> </br>";
		for(var i=0, len = samples.models.length;i<len;i++){
               html += "<div style='font-weight: normal'> Sample ID : "+samples.models[i].get("sampleId")+ 
               "</br>Sample Name : "+samples.models[i].get("sampleName")+ 
              "</br>Library Kit : "+samples.models[i].get("libraryPrepReagentBarcode")+            
              "</br>Barcode ID : "+samples.models[i].get("barcode").idStr+ 
              "</br>Created By : "+samples.models[i].get("createdBy")+                        
              "</br>Created On : "+samples.models[i].get("createdDate")+                                    
              "</br>Description  : "+samples.models[i].get("description")+"</div><br><br>";	   
		}
		var printWindow=window.open();
		if(printWindow){
		printWindow.document.write(html);
		printWindow.print();
		printWindow.close();
		}else{
		alert("Please allow pop-ups");
		}
	    },

            _goToPage: function(url) {
                window.location = url;
            },

            _onOpenAddSample: function() {
                new ManageSampleAddView({
		    grid: this.gridView
                }).render();
            },
            
            onFilterChange: function() {
                if($("#filterCondition").val() === "createdOn"){
                    $("#searchCondition").val("");
                    $("#searchCondition").hide();
                    $("#startDate,#endDate").parent().parent().show();
                }else{
                    $("#startDate,#endDate").val(""); 
                    $("#startDate,#endDate").parent().parent().hide(); 
                    $("#searchCondition").show();
                }
            },

            _onExport: function() {
                var samples = JSON.stringify(this.gridView.getSelected().toJSON());
                window.location.href = '/ir/secure/api/samplemanagement/samples/export?samples='+samples;
	    },
	        
	    _onPlanARun: function(e){
	       	var samples = this.gridView.getSelected().toJSON();
	       	var planARun = new PlanARunView({
	       		data: samples
                });
	       	planARun.render();
	        $("#selectedSamplePlanRun").html(this.gridView.getSelected().toJSON().length);
	    },
	
	    _onReset: function(){
		this.gridView.clearFilter("startDate");
                this.gridView.clearFilter("endDate");
		this.gridView.clearFilter("sampleId");
		this.gridView.clearFilter("createdBy");
		$("#startDate,#endDate").val(""); 
                $("#startDate,#endDate").parent().parent().hide(); 
          	$("#searchCondition").show();
	    },
	    
	   
	        
        });

        return manageSamplesOverview;
    }
);