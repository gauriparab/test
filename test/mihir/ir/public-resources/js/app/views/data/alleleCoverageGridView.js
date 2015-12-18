/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/data/alleleCoverage'].concat(
    'utils/templateFunctions'
), 
    function($,
    		_, 
    		kendo, 
    		KendoGridView, 
    		AlleleCoverage){

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

            _url: '/ir/secure/api/data/alleleConverage',

            _model: AlleleCoverage,
	
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
                
                var targetIdColumn  = this.cb()
	                .field('targetId')
	                .title($.t('alleleCoverage.tab.targetId'))
	                .build();
                
                var hotSpotColumn  = this.cb()
	                .field('hotspotId')
	                .title($.t('alleleCoverage.tab.hotspotId'))
	                .build();
                
                var refColumn  = this.cb()
	                .field('ref')
	                .title($.t('alleleCoverage.tab.refBase'))
	                .build();
                
                var covColumn  = this.cb()
	                .field('cov')
	                .title($.t('alleleCoverage.tab.cov'))
	                .build();
                
                var aReadsColumn  = this.cb()
	                .field('aReads')
	                .title($.t('alleleCoverage.tab.aReads'))
	                .build();
                
                var cReadsColumn  = this.cb()
	                .field('cReads')
	                .title($.t('alleleCoverage.tab.cReads'))
	                .build();
                
                var gReadsColumn  = this.cb()
	                .field('gReads')
	                .title($.t('alleleCoverage.tab.gReads'))
	                .build();
                
                var tReadsColumn  = this.cb()
	                .field('tReads')
	                .title($.t('alleleCoverage.tab.tReads'))
	                .build();
                
                var deletionsColumn  = this.cb()
	                .field('deletions')
	                .title($.t('alleleCoverage.tab.deletions'))
	                .build();
                
                var posCovColumn  = this.cb()
	                .field('covPositive')
	                .title($.t('alleleCoverage.tab.posCov'))
	                .build();
                
                var negCovColumn  = this.cb()
	                .field('covNegative')
	                .title($.t('alleleCoverage.tab.negCov'))
	                .build();

		 return [
		         chromColumn,
		         positionColumn,
		         targetIdColumn,
		         hotSpotColumn,
		         refColumn,
		         covColumn,
		         aReadsColumn,
		         cReadsColumn,
		         gReadsColumn,
		         tReadsColumn,
		         deletionsColumn,
		         posCovColumn,
		         negCovColumn
                ];
            }

        });

        return AlleleCoverageGridView;
});
