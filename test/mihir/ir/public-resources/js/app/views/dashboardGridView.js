/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
].concat(
        'utils/templateFunctions',
        'views/common/grid/plugins/actionsGridPlugin'),

    function($,
             _,
             kendo,
             KendoGridView){

        'use strict';

        var DashboardGridView = KendoGridView.extend({

            _url: '/ir/secure/api/data/snpVariantByFilter',


            initialize: function(options) {
            },
            
            _columns: function() {

            	var columns = [];
            	
            	var self= this;
            	
                var geneSymbol = this.cb()
                    .field('geneSymbol')
                    .title($.t('variant.table.geneSymbolFull'))
                    .template("<a href='javascript:void(0)' data-action='view_annotationSources'>#= geneSymbol #</a>")
                    .build();
					
                var testResultColumn = this.cb()
                    .field('testResult')
                    .title($.t('variant.table.testResult'))
                    .build();
				
                var locusColumn = this.cb()
	                .field('locus')
	                .title($.t('variant.table.locus'))
	                .build();
                
                var typeColumn = this.cb()
                	.field('type')
                	.title($.t('variant.table.type'))
                	.build();
                
                var genotypeColumn = this.cb()
                    .field('genotype')
                    .title($.t('variant.table.genotype'))
                    .build();
                
                var refColumn = this.cb()
                	.field('ref')
                	.title($.t('variant.table.ref'))
                	.build();

                var varFrqColumn = this.cb()
	            	.field('varFreq')
	            	.title($.t('variant.table.varFrq'))
	            	.build();
                
                var qualityScoreColumn = this.cb()
	            	.field('qualityScore')
	            	.title($.t('variant.table.qualityScore'))
	            	.build();
                
                var coverageColumn = this.cb()
	            	.field('coverage')
	            	.title($.t('variant.table.coverage'))
	            	.build();
                
                var hotspotIdColumn = this.cb()
	            	.field('hotspotID')
	            	.title($.t('variant.table.hotspotID'))
	            	.build();
                
            	
            	
            	columns.push(geneSymbol);
				columns.push(hotspotIdColumn);
				columns.push(testResultColumn);
				columns.push(locusColumn);
				columns.push(typeColumn);
				columns.push(genotypeColumn);
				columns.push(refColumn);
				columns.push(varFrqColumn);
				columns.push(qualityScoreColumn);
				columns.push(coverageColumn);
		        return columns;
            }
            
        });

        return DashboardGridView;

    }
);
