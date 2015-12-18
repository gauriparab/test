/*global define:false*/
define(['jquery', 'underscore', 'kendo', 'views/manageSampleFormView', 'views/assay/manageSamplesGridView', 'views/samples/sampleSearchView', 'hb!templates/assay/add-sample-view.html']
    .concat('bootstrap'),

    function($, _, kendo, FormView, SampleGridView, SampleSearchView, template) {
        'use strict';
        var AddSampleView = FormView.extend({
        	
            el: "#addSampleModal",
            _searchEl: '#query-form',
            _gridEl: '#viewsamples-grid',

            initialize: function(options) {
                options = options || {};
                this.parentGrid = options.grid;
                this.gridView = new SampleGridView({});
                this.searchView = new SampleSearchView();         
                this.searchView.on('search', this._onSearch, this);
            },
            
            delegateEvents : function() {
				FormView.prototype.delegateEvents.apply(this, arguments);
			},
			
			undelegateEvents : function() {
				FormView.prototype.undelegateEvents.apply(this, arguments);
			},
             
            render: function() {
            	this.$el.html(template({}));
            	this.gridView.on('multiSelect', this._onGridMultiSelect, this);
            	this.searchView.setElement(this.$(this._searchEl)).render();
            	this.gridView.setElement(this.$(this._gridEl)).render();
            	this.$el.modal({
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true
                });
                return this;
            },
            
            events: {
                'click button#addSamplesToGrid' : 'save',
                'click button#gridReset': '_onReset',
                'change #filterCondition': 'onFilterChange'
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
            
            _onGridMultiSelect: function(samples) {
            	this.samples = samples;
            },
            
            save: function() {
            	var self = this;
            	var samples = this.parentGrid.$el.data('kendoGrid').dataSource.data().toJSON();
            	_.each(this.samples.toJSON(), function(sample){
            		var temp = _.filter(samples, function(sam){
            			return sam.sampleId === sample.sampleId;
            		});
            		if(!temp.length){
            			sample.barcodeId = sample.barcode.idStr;
            			sample.libraryKit = sample.libraryPrepReagentBarcode;
            			samples.push(sample);
            		}
            	});
            	this.parentGrid.$el.data('kendoGrid').dataSource.data(samples);
            	this.closeDialog();
            },

            closeDialog: function() {
            	var self = this;
            	this.$el.unbind('hide').on('hide', function () {
            		self.undelegateEvents();
	                self.unbind();
	            });
                this.$el.modal('hide');
            },
            
            _onReset: function(){
        		this.gridView.clearFilter("startDate");
                this.gridView.clearFilter("endDate");
        		this.gridView.clearFilter("sampleId");
        		this.gridView.clearFilter("createdBy");
        		$("#startDate,#endDate").val("");
                $("#startDate,#endDate").parent().parent().hide(); 
                $("#searchCondition").show();
        	}

        });

        return AddSampleView;
    });
