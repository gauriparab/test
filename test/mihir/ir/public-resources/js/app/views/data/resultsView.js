/* global define:false*/
define([
    'views/ParentView',
    'views/common/searchView', 
    'views/data/resultDataGrid',
    'views/assay/assayDetailView',
    'views/samples/specimenDetailsView',
    'views/common/baseModalView',
    'models/data/specimen',
    'hb!templates/data/result-view.html'
],
    function(
    	ParentView,
    	SearchView,
        ResultDataGrid,
        AssayDetailView,
        SpecimenDetailsView,
        BaseModalView,
        SpecimenModel,
        template) {

	'use strict';

    /**
     * result page
     *
     * @type {*}
     */
    var ResultsView = ParentView.extend({

        _template: template,
        _gridEl: '#result-grid',
        _searchEl: '#query-form',

        initialize: function(options) {
        	this.searchView = new SearchView({
				placeHolder: 'grid.column.specimenId'
			});
        	this.searchView.on('search', this._onSearch, this);
			this.searchView.on('reset', this._onReset, this);
            this.gridView = new ResultDataGrid();         
            this.gridView.on('action:view_assayDetails', this._showAssayDetails, this);
            this.gridView.on('action:view_allResults', this._showAllResults, this);
            this.gridView.on('action:view-details', this._viewDetails, this);
            this.gridView.addFilter('show', "all");
			this.gridView.addFilter('specimenId', "");
        },

        render: function() {
            this.$el.html(template());
			this.renderSubView(this.searchView, this._searchEl);
			this.renderSubView(this.gridView, this._gridEl);
        },

	    _showAssayDetails: function(e, assay) {
	    	var self = this;
            BaseModalView.open(null, {
                el: "#viewAssayDetails",
                assayId : assay.get('assay').id
            }, AssayDetailView);
   		},
   		
   		delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
        },

        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },
   		
   		_viewDetails: function(e, model) {
   			var specimenId = model.get('specimen').id;
   			this.specimenModel = new SpecimenModel({
   				id : specimenId
   			});
   			var self = this;
   			$.when(this.specimenModel.fetch()).done(function(){
   				BaseModalView.open(null, {
   					el: "#viewSpecimen",
   					model: self.specimenModel,
   					hasViewPermission: self.options.hasViewPermission
   				}, SpecimenDetailsView);
			});	
		},
   		
		_showAllResults: function(e, results) {
   			window.location = "allResults/"+results.attributes.assay.id+"/"+results.attributes.specimen.id;
   		},
   		
   		_onSearch: function(query) {
            this.gridView.addFilter('specimenId', query);     
            this.gridView.$el.data('kendoGrid').dataSource.page(1);
        },
		
		_onReset: function() {
            this.gridView.addFilter('specimenId', "");     
        },
        
    });
    return ResultsView;
});
