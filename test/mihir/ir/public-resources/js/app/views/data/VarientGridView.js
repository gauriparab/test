/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/data/varient'].concat(
    'utils/templateFunctions'
), 
    function($,
    		_, 
    		kendo, 
    		KendoGridView, 
    		Varient){

    	 'use strict';
    		var Transport = kendo.Class.extend({

    	        _grid: null,

    	        /**
    	         * Constructor
    	         * @param options
    	         */
    	        init: function(grid) {
    	            this._grid = grid;
    	        },

    	        /**
    	         * Method for fetching data
    	         *
    	         * @param options
    	         */
    	        read: function(options) {
    	            $.ajax({
    	                url: this._grid._url + '?' + $.param(_.extend({},
    	                    this._parameterMap(options.data),
    	                    this._grid._filters
    	                )),
    	                type: 'POST',
    			data: JSON.stringify(this._grid._filters),
    	                contentType: 'application/json',
    	                success: options.success,
    	                error: options.error
    	            });
    	        },

    	        /**
    	         * Convert kendo grid parameters to spring parameters
    	         *
    	         * @param options
    	         * @returns {Object|*|Mixed}
    	         * @private
    	         */
    	        _parameterMap: function(options) {
    	            return _.reduce(options, function(memo, v, k) {
    	                switch (k) {
    	                case 'take':
    	                    memo['page.size'] = v;
    	                    break;
    	                case 'page':
    	                    memo['page.page'] = v;
    	                    break;
    	                case 'sort':
    	                    _.each(v, function(sortObj) {
    	                        memo['page.sort'] = sortObj.field;
    	                        memo['page.sort.dir'] = sortObj.dir;
    	                    });
    	                    break;
    	                }
    	                return memo;
    	            }, {});
    	        }

    	    });

	 var AlleleCoverageGridView = KendoGridView.extend({

            _url: '/ir/secure/api/data/variant',

            _model: Varient,
	
            _scrollable: true,
            
            _serverSorting: false,
            
            _serverPaging: false,
            
            _total: function(response) {
                return $(response.content).length;
            },

	    initialize: function(options) {
	    	this._filters = { resultId : options.resultId};
            KendoGridView.prototype.initialize.apply(this, arguments);
        },

	    _columns: function() {
                var chromColumn  = this.cb()
                    .field('chrom')
                    .title($.t('alleleCoverage.tab.chrom'))
                    .build();
                
                var positionColumn  = this.cb()
	                .field('position')
	                .title($.t('alleleCoverage.tab.position'))
	                .build();
                
                var geneSymColumn  = this.cb()
	                .field('geneSym')
	                .title($.t('variant.tab.geneSym'))
	                .width("10%")
	                .build();
                
                var targetIdColumn  = this.cb()
	                .field('targetId')
	                .title($.t('alleleCoverage.tab.targetId'))
	                .width("10%")
	                .build();
                
                var typeColumn  = this.cb()
	                .field('type')
	                .title($.t('variant.tab.type'))
	                .build();
                
                var zygosityColumn  = this.cb()
	                .field('zygosity')
	                .title($.t('variant.tab.zygosity'))
	                .build();
                
                var genotypeeColumn  = this.cb()
	                .field('genotype')
	                .title($.t('variant.tab.genotype'))
	                .build();
                
                var refColumn  = this.cb()
	                .field('ref')
	                .title($.t('alleleCoverage.tab.ref'))
	                .build();
                
                var variantColumn  = this.cb()
	                .field('variant')
	                .title($.t('variant.tab.variant'))
	                .build();
                
                var varFreqColumn  = this.cb()
	                .field('varFreq')
	                .title($.t('variant.tab.varFreq'))
	                .build();
                
                var qualColumn  = this.cb()
	                .field('qual')
	                .title($.t('variant.tab.qual'))
	                .build();
                
                var coverageColumn  = this.cb()
	                .field('coverage')
	                .title($.t('variant.tab.coverage'))
	                .build();
                
                var refCovColumn  = this.cb()
	                .field('refCov')
	                .title($.t('variant.tab.refCov'))
	                .build();
                
                var varCovColumn  = this.cb()
	                .field('varCov')
	                .title($.t('variant.tab.varCov'))
	                .build();
                
                var hotSpotColumn  = this.cb()
	                .field('hotspotId')
	                .title($.t('alleleCoverage.tab.hotspotId'))
	                .build();
                
		 return [
		         chromColumn,
		         positionColumn,
		         geneSymColumn,
		         targetIdColumn,
		         typeColumn,
		         zygosityColumn,
		         genotypeeColumn,
		         refColumn,
		         variantColumn,
		         varFreqColumn,
		         qualColumn,
		         coverageColumn,
		         refCovColumn,
		         varCovColumn,
		         hotSpotColumn
                ];
            }

        });

        return AlleleCoverageGridView;
});
