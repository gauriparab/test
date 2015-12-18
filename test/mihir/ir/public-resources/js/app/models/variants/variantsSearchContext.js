/*global define:false*/
define(['underscore', 'backbone', 'models/baseModel', 'collections/filterCollection'],
    function(_, Backbone, BaseModel, FilterCollection) {
        'use strict';

        var VariantSearchContext = BaseModel.extend({

            defaults: {
                group: 'DEFAULT',
                variantCriteria: {
                	chromosome: {
                		name: 'All'
                	},
                	filterChain: {
                		id: ''
                	}
                }
            },

            initialize: function() {
                this.on('change:variantCriteria', function() {
                    // When I'm viewing hidden variants, and I change the filter chain,
                    // my view should be updated to the filtered variants view and show the updated list of filtered variants
                    if (this.isHiddenGroup()) {
                        this.set('group', 'DEFAULT');
                    }
                }, this);
            },

            /*setAnalysis: function(analysis) {
                this.set("analysis", analysis);
            },*/

            setFilterChainCriteria: function(filterChain) {
                var filterChainCriteria = null;
                if (filterChain) {
                    var variantCriteria = this.get('variantCriteria');
                    filterChainCriteria = {
                        _type: '.FilterChainBasedVariantCriteria',
                        filterChain: filterChain,
                        variantsBySpecimenFilter : variantCriteria && variantCriteria.variantsBySpecimenFilter
                    };
                } else {
                    filterChainCriteria = {
                        _type: '.DefaultVariantCriteria',
                        filterChain: {
                        	id:''
                        },
                        defaultFilterChainEnabled: false
                    };
                }
                this.set('variantCriteria', filterChainCriteria);
            },

            setVariantsBySpecimenFilter: function(specimenRoles) {

                var variantCriteria = this.get('variantCriteria');
                if (!variantCriteria) {
                    variantCriteria = {
                        _type: '.DefaultVariantCriteria',
                        variantsBySpecimenFilter: 'UNION'
                    };
                }

                if (specimenRoles) {

                    if (specimenRoles.length === 0) {
                        variantCriteria.variantsBySpecimenFilter = 'UNION';
                    } else if (specimenRoles.length === 1) {
                        variantCriteria.variantsBySpecimenFilter = this._variantsBySpecimenRole(specimenRoles[0]);
                    } else if (specimenRoles.length === 2) {
                        variantCriteria.variantsBySpecimenFilter =
                            this._variantsBySpecimenRoles(_.map(specimenRoles, this._variantsBySpecimenRole));
                    } else {
                        variantCriteria.variantsBySpecimenFilter = 'INTERSECTION';
                    }

                }
                this.set('variantCriteria', variantCriteria);
            },

            _variantsBySpecimenRole: function(specimenRole) {
                switch (specimenRole) {
                case 'MOTHER':
                    return 'MOTHER';

                case 'FATHER':
                    return 'FATHER';

                case 'CHILD':
                case 'PROBAND':
                    return 'PROBAND';

                case 'NORMAL':
                case 'CONTROL':
                    return 'NORMAL';

                case 'SAMPLE':
                case 'TUMOR':
                    return 'TUMOR';

                }
                return 'UNION';
            },

            _isMotherAndFather: function(roles) {
                return _.every(roles, function(x) {
                    return _.contains(['MOTHER', 'FATHER'], x);
                });
            },

            _isMotherAndProband: function(roles) {
                return _.every(roles, function(x) {
                    return _.contains(['MOTHER', 'PROBAND'], x);
                });
            },

            _isFatherAndProband: function(roles) {
                return _.every(roles, function(x) {
                    return _.contains(['FATHER', 'PROBAND'], x);
                });
            },

            _variantsBySpecimenRoles: function(roles) {
                if (this._isMotherAndFather(roles)) {
                    return 'NOT_PROBAND';
                }
                if (this._isMotherAndProband(roles)) {
                    return 'NOT_FATHER';
                }
                if (this._isFatherAndProband(roles)) {
                    return 'NOT_MOTHER';
                }
                return 'INTERSECTION';
            },


            /**
             * Set a transientfilter based variant criteria.
             */
            setTransientFilters: function(filterChain) {
            	var filters=filterChain.getFilters();
                var filtersCriteria = null;
                var variantFilters;
                if (filters && !(_.isArray(filters) && filters.length === 0)) {
                    variantFilters = filters instanceof Backbone.Collection ? filters : new FilterCollection(filters);
                    var variantCriteria = this.get('variantCriteria');
                    filtersCriteria = {
                        _type: '.TransientFiltersBasedVariantCriteria',
                        filters: variantFilters,
                        variantsBySpecimenFilter : variantCriteria && variantCriteria.variantsBySpecimenFilter,
                        filterChain:filterChain
                    };
                }
                this.set('variantCriteria', filtersCriteria);
            },

            getVariantCriteriaType: function() {
                var variantCriteria = this.get('variantCriteria');
                return variantCriteria && variantCriteria._type;
            },

            getFiltering: function() {
                return this._filtering;
            },

            setFiltering: function(filtering) {
                this._filtering = filtering;
            },

            setQuery: function(query) {
                this.set('query', query);
                this.trigger('refreshVariantsGrid');
            },

            setGroup: function(group) {
                this.set('group', group);
                this.trigger('refreshVariantsGrid');
            },

            isHiddenGroup: function() {
                return this.get('group') === 'HIDDEN';
            },

            isFilteredInGroup: function() {
                return this.get('group') === 'DEFAULT';
            },

            getChromosome: function() {
                return this._chromosome;
            },

            setChromosome: function(chromosome) {
                this._chromosome = chromosome;
                this.trigger('refreshVariantsGrid');
            },

            getFilterChain: function() {
                if (this.getVariantCriteriaType() !== '.FilterChainBasedVariantCriteria') {
                    return false;
                }
                var filterChain = this.get('variantCriteria').filterChain;
                return filterChain;
            },

            toSlimJSON: function() {
                var json = this.toJSON();
                var slimJson = {};
                var variantCriteriaType = this.getVariantCriteriaType();
                slimJson.analysisList = json.analyses || null;
                slimJson.query = json.query || null;
                slimJson.group = json.group || null;
                switch (variantCriteriaType) {
                case '.FilterChainBasedVariantCriteria':
                    slimJson.variantCriteria = {
                        _type: variantCriteriaType,
                        filterChain: json.variantCriteria.filterChain && _.pick(json.variantCriteria.filterChain, 'id') || null,
                        variantsBySpecimenFilter : json.variantCriteria && json.variantCriteria.variantsBySpecimenFilter || 'UNION'
                    };
                    break;
                case '.TransientFiltersBasedVariantCriteria':
                    slimJson.variantCriteria = {
                        _type: variantCriteriaType,
                        filters: _.map(json.variantCriteria.filters.models, function(filter) {
                            return filter instanceof Backbone.Model ? filter.toJSON() : filter;
                        }),
                        variantsBySpecimenFilter : json.variantCriteria && json.variantCriteria.variantsBySpecimenFilter || 'UNION',
                        filterChain: json.variantCriteria.filterChain
                    };
                    break;
                case '.DefaultVariantCriteria':
                    slimJson.variantCriteria = json.variantCriteria;
                    break;
                default:
                    slimJson.variantCriteria = null;
                	//slimJson.variantCriteria = json.variantCriteria;
                }
                if (!slimJson.variantCriteria) {
                    slimJson.variantCriteria = {
                        _type: '.DefaultVariantCriteria',
                        filterChain: {
                        	id: ''
                        }
                    };
                }
                if (this._chromosome) {
                    /*if (!slimJson.variantCriteria) {
                        slimJson.variantCriteria = {
                            _type: '.DefaultVariantCriteria'
                        };
                    }*/
                    slimJson.variantCriteria.chromosome = {name: this._chromosome};
                } else {
                    if (slimJson.variantCriteria) {
                        slimJson.variantCriteria.chromosome = {name: 'All'};
                    }
                }

                return slimJson;
            }

        });

        return VariantSearchContext;
    });