/*global define:false*/
define(['jquery', 
        'views/ParentView',
        'models/variants/variantsSearchContext',
        'models/variants/variantAnnotationsResultsSummary',
        'collections/analysis/analyses',
        'collections/assayFilterChains',
        'views/variants/variantsChromosomesFilterView',
        'views/variants/variantsGroupFiltersView',
        'views/variants/variantsFilteringView',
        'views/presetFilterChainView',
        'events/eventDispatcher',
        'hb!templates/data/variant-filters.html'].concat("bootstrap"), 
    function ($, 
    		  ParentView,
    		  VariantsSearchContext,
    		  VariantAnnotationsResultsSummary,
    		  Analyses,
    		  FilterChains,
    		  VariantsChromosomesFilterView,
    		  VariantsGroupFiltersView,
    		  VariantsFilteringView,
    		  FilterChainView,
    		  dispatcher,
    		  template) {
    "use strict";
    var VariantFiltersView = ParentView.extend({

        initialize: function (options) {
            /*if($("#sidebarClose").parent().parent().is(":visible")){
            	this.closeSideBar = true;
            }*/
            this.model= options.model;
            this.assay=options.assay;
            this.assayId=options.assayId;
            this.gridView=options.gridView;
            this.tabName=options.tabName;
            this.analyses = new Analyses(this.model);
            this._filterChains = new FilterChains();
            this._variantsSearchContext = new VariantsSearchContext({
                analyses: this.analyses
            });
            
            this._resultsSummary = new VariantAnnotationsResultsSummary(); 
            this.variantsCount;
            
            var libraryName= options.libraryName;
            this.libraries= libraryName.split(",");
            
            this.listenTo(this._variantsSearchContext, 'refreshVariantsGrid', this._renderVariantsGrid, this);
            
        },
        
        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
            dispatcher.on('variants:countChanged', this.getVariantCounts, this);
        },
        
        undelegateEvents: function() {
            dispatcher.off('variants:countChanged');
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },
        
        render : function () {
            var templateJson = this.model.toJSON();
            templateJson.libraries=this.libraries;
            this.$el.html(template({
            	libraries:this.libraries
            }));
		    if($("#filter-table")[0]) {
		    	$("#filter-table").scrollTop($("#filter-table")[0].scrollHeight);
		    }
		    if(this.closeSideBar){
		    	$("#sidebarClose").click();
		    } else{
		    	$("#sidebarOpen").click();
		    }
		    
		    this._chromosomesFilterView = new VariantsChromosomesFilterView({
                variantsSearchContext: this._variantsSearchContext,
                analyses: this.analyses
            });
		    
		    this._variantsFilteringView = new VariantsFilteringView({
                analysis: this.model,
                filterChains: this._filterChains,
                variantsSearchContext: this._variantsSearchContext,
                assay: this.assay,
                assayId: this.assayId,
                readOnly: false //this.readOnly || !options.canFilterVariants
            });
		    
		    
        	this.renderSubView(this._chromosomesFilterView, '#chromosomes-container');
        	//this.renderSubView(this._variantsGroupFiltersView, '#variants-group-filters');
        	this.renderSubView(this._variantsFilteringView, '#filter-chains-container');
            return this;
        },
        
        _renderVariantsGrid : function() {
        	var filterJSON=this._variantsSearchContext.toSlimJSON(); 
        	if (filterJSON.variantCriteria.chromosome === null)
        		this.gridView.addFilter('chromosome', 'All');
        	else
        		this.gridView.addFilter('chromosome', filterJSON.variantCriteria.chromosome.name);
        	if(filterJSON.variantCriteria.filterChain)
        		this.gridView.addFilter('filterChainId', filterJSON.variantCriteria.filterChain.id);
        	else 
        		this.gridView.addFilter('filterChainId', "");
        	this.gridView.addFilter('variantType', filterJSON.group);
        	this.gridView.render();
        },
        
        getVariantCounts : function() {
        	var self= this;
        	var filterJSON=this._variantsSearchContext.toSlimJSON();
        	$.ajax({
                url: '/ir/secure/api/data/getVariantCounts?resultId='+self.gridView.options.resultId+'&chromosome='+filterJSON.variantCriteria.chromosome.name+'&tabName='+this.tabName+'&filterChainId='+filterJSON.variantCriteria.filterChain.id,
                type: 'GET',
                contentType: 'application/json',
                success: function(response) {
                	self.variantsCount= response;
                	self._variantsGroupFiltersView = new VariantsGroupFiltersView({
                        analyses: self.analyses,
                        searchContext: self._variantsSearchContext,
                        resultsSummary: self._resultsSummary,
                        variantsCount: self.variantsCount
                    });
                	self.renderSubView(self._variantsGroupFiltersView, '#variants-group-filters');
                }
                
            });
        }

    });

    return VariantFiltersView;
});
