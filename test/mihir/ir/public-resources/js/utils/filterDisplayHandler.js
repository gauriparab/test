/* global define:false */
define(['jquery', 'underscore'],
function($, _) {

    "use strict";

    var FilterDisplayHandler = function() {
    };

    FilterDisplayHandler.prototype.selectFilterHandler = function(filter) {
        var filterHandlers = [
            new MultiSelectFilterHandler(),
            new DynamicMultiSelectFilterHandler(),
            new RangeFilterHandler(),
            new FixedLowRangeFilterHandler(),
            new SingleSelectFilterHandler(),
            new OntologyFilterHandler(),
            new LogicalFilterGroupHandler()
        ];
        return _.find(filterHandlers, function(handler) {
            return handler._canHandle(filter);
        });
    };

    FilterDisplayHandler.prototype.getFilterDisplayValue = function(filter) {
        var filterHandler = this.selectFilterHandler(filter);
        var filterExpr = null;
        if (filterHandler) {
            filterExpr = filterHandler._filterExpr(filter);
            if (filterExpr) {
                return filterExpr;
            } else {
                return this._getUndefinedFilter(filter.name);
            }
        } else {
            return 'Unknown filter';
        }
    };
    
    FilterDisplayHandler.prototype._getUndefinedFilter = function(name) {
        return name + ' is undefined';
    };

    FilterDisplayHandler.prototype.getFilterIncludeMissing = function(filter) {
        if (filter._type === '.filter.LogicalFilterGroup') {
            return _.any(filter.filters, _.property('configuredIncludeMissing'));
        }
        return filter.configuredIncludeMissing || false;
    };

    FilterDisplayHandler.prototype.getFilterHandleMissing = function(filter) {
        if (filter._type === '.filter.LogicalFilterGroup') {
            return _.any(filter.filters, _.property('handleMissing'));
        }
        return filter.handleMissing || false;
    };

    /**
     * FilterHandler.
     */
    function FilterHandler() {
        this._supportedFilterType = null;
    }

    FilterHandler.prototype._canHandle = function(filter) {
        return this._supportedFilterType === filter._type;
    };

    /* jshint unused:false */
    FilterHandler.prototype._filterExpr = function(filter) {
        return null;
    };

    function MultiSelectFilterHandler() {
        this._supportedFilterType = '.filter.MultipleSelectFilter';
    }
    MultiSelectFilterHandler.prototype = new FilterHandler();
    MultiSelectFilterHandler.prototype.constructor = MultiSelectFilterHandler;

    MultiSelectFilterHandler.prototype._filterExpr = function(filter) {

        if (filter.configuredFilterOption && filter.configuredFilterOption === 'INCLUDE') {
            return filter.name + ' = In';
        }
        if (filter.configuredFilterOption && filter.configuredFilterOption === 'EXCLUDE') {
            return filter.name + ' = Not In';
        }
        if (filter.configuredFilterOption && filter.configuredFilterOption === 'CONFIGURED' && filter.configuredValues &&
                _.isArray(filter.configuredValues) && filter.configuredValues.length > 0) {
            return filter.name + ' in ' + filter.configuredValues.join(', ');
        } else {
            return null;
        }
    };
    
    function DynamicMultiSelectFilterHandler() {
        this._supportedFilterType = '.filter.DynamicMultipleSelectFilter';
    }
    DynamicMultiSelectFilterHandler.prototype = new MultiSelectFilterHandler();
    DynamicMultiSelectFilterHandler.prototype.constructor = DynamicMultiSelectFilterHandler;

    function RangeFilterHandler() {
        this._supportedFilterType = '.filter.RangeFilter';
    }
    RangeFilterHandler.prototype = new FilterHandler();
    RangeFilterHandler.prototype.constructor = RangeFilterHandler;

    RangeFilterHandler.prototype._filterExpr = function(filter) {
        var defaultRange = {from: null, to: null};
        var range = filter.configuredRange && _.defaults(filter.configuredRange, defaultRange) || defaultRange;
        return this._getRangeExpr(filter.name, range, filter.configuredInclusive);
    };

    RangeFilterHandler.prototype._getRangeExpr = function(name, range, closedRange) {
        var inclusiveComparison = closedRange ? '=' : '';
        if (range.from && range.to) {
            if (range.from === range.to) {
                return name + ' = ' + range.from;
            } else {
                return range.from +
                    ' <' + inclusiveComparison + ' ' +
                    name +
                    ' <' + inclusiveComparison + ' ' +
                    range.to;
            }
        } else if (range.from) {
            return name +
                ' >' + inclusiveComparison + ' ' +
                range.from;
        } else if (range.to) {
            return name +
                ' <' + inclusiveComparison + ' ' +
                range.to;
        } else {
            return null;
        }
    };

    function FixedLowRangeFilterHandler() {
        this._supportedFilterType = '.filter.FixedLowRangeFilter';
    }
    FixedLowRangeFilterHandler.prototype = new RangeFilterHandler();
    FixedLowRangeFilterHandler.prototype.constructor = FixedLowRangeFilterHandler;

    FixedLowRangeFilterHandler.prototype._filterExpr = function(filter) {
        var defaultRange = {from: undefined, to: filter.configuredHigh};
        var range = filter.canonical && _.defaults(defaultRange, filter.canonical) || defaultRange;
        return this._getRangeExpr(filter.name, range, filter.configuredInclusive);
    };

    function SingleSelectFilterHandler() {
        this._supportedFilterType = '.filter.SingleSelectFilter';
    }
    SingleSelectFilterHandler.prototype = new FilterHandler();
    SingleSelectFilterHandler.prototype.constructor = SingleSelectFilterHandler;

    SingleSelectFilterHandler.prototype._filterExpr = function(filter) {
        if (filter.configuredValue) {
            return filter.name + ' = ' + filter.configuredValue;
        } else if (filter.defaultValue) {
            return filter.name + ' = ' + filter.defaultValue;
        } else {
            return null;
        }
    };

    function OntologyFilterHandler() {
        this._supportedFilterType = '.filter.OntologyFilter';
    }
    OntologyFilterHandler.prototype = new FilterHandler();
    OntologyFilterHandler.prototype.constructor = OntologyFilterHandler;

    OntologyFilterHandler.prototype._filterExpr = function(filter) {
        if (filter.selected &&
                _.isArray(filter.selected) && filter.selected.length > 0) {
            return filter.name + ' in: ' +
                _.map(filter.selected, function(aNode){
                    return aNode.name;
                }).join(', ');
        } else {
            return null;
        }
    };
    function LogicalFilterGroupHandler() {
        this._supportedFilterType = '.filter.LogicalFilterGroup';
    }
    LogicalFilterGroupHandler.prototype = new FilterHandler();
    LogicalFilterGroupHandler.prototype.constructor = LogicalFilterGroupHandler;

    LogicalFilterGroupHandler.prototype._operatorPrecedence = function(filter) {
        var operators = ["SIMPLE FILTER", "AND", "OR"];
        var precedence = 0;
        if (filter._type === '.filter.LogicalFilterGroup') {
            precedence = _.indexOf(operators, filter.operator);
            if (precedence === -1) {
                precedence = 1; // defaults to AND
            }
        }
        return precedence;
    };

    LogicalFilterGroupHandler.prototype._filterExpr = function(filter) {
        var expr = '';
        var currentFilterExpr;
        var filters = (filter.filters && filter.filters.models) || filter.filters;
        var thisFilterPrecedence = this._operatorPrecedence(filter);
        if (filters && filters.length > 0) {
            _.each(filters, function(curFilter) {
                if ($.isFunction(curFilter.toJSON)) {
                    curFilter = curFilter.toJSON();
                }

                if (curFilter.enabled){
                    currentFilterExpr =
                    new FilterDisplayHandler().selectFilterHandler(curFilter)._filterExpr(curFilter);
                    if (currentFilterExpr) {
                        if (expr !== '') {
                            expr += ' ' + filter.operator + ' ';
                        }
                        if (_.size(filter.filters) > 0 &&
                            this._operatorPrecedence(curFilter) > thisFilterPrecedence) {
                            expr += '(' + currentFilterExpr + ')';
                        } else {
                            expr += currentFilterExpr;
                        }
                    }
                }
            }, this);
            return expr;
        } 
        return null;
    };

    return FilterDisplayHandler;
});
