/*global define:false*/
define([
    'views/filterChains/filterEditTypeRangeView',
    'views/filterChains/filterEditTypeFixedLowRangeView',
    'views/filterChains/filterEditTypeSingleSelectView',
    'views/filterChains/filterEditTypeMultipleSelectView',
    'views/filterChains/filterEditTypeDynamicMultipleSelectView',
    'views/filterChains/filterEditTypeLogicalFilterGroupView' 
],
function(FilterEditTypeRangeView, FilterEditTypeFixedLowRangeView, 
        FilterEditTypeSingleSelectView, FilterEditTypeMultipleSelectView, 
        FilterEditTypeDynamicMultipleSelectView, FilterEditTypeLogicalFilterGroupView) {
    "use strict";
   
    /**
     * Provides a mapping from filter type to view.
     */
    
    var _viewsByFilterType = {
            '.filter.RangeFilter': FilterEditTypeRangeView,
            '.filter.FixedLowRangeFilter': FilterEditTypeFixedLowRangeView,
            '.filter.SingleSelectFilter': FilterEditTypeSingleSelectView,
            '.filter.MultipleSelectFilter': FilterEditTypeMultipleSelectView,
            '.filter.DynamicMultipleSelectFilter': FilterEditTypeDynamicMultipleSelectView,
            '.filter.OntologyFilter': null,
            '.filter.LogicalFilterGroup': FilterEditTypeLogicalFilterGroupView
        };
    
    var resolver = {
        viewForType: function(type) {
            return _viewsByFilterType[type];
        }
    }; 
    
    // cyclic dependency between logical group view and the resolver
    FilterEditTypeLogicalFilterGroupView.resolver = resolver;
    return resolver;
    
});
    