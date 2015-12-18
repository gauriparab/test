/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/variantDetection'
].concat(
    'utils/templateFunctions',
    'views/common/grid/plugins/rowSelectionGridPlugin',
    'views/common/grid/plugins/actionsGridPlugin',
    'views/common/grid/plugins/multiSelectionGridPlugin'),

    function($,
             _,
             kendo,
             KendoGridView,
             VariantDetection){

        'use strict';

        var PopulationGridView = KendoGridView.extend({

            _url: '/ir/secure/api/data/populationAnnotation',

            _model: VariantDetection,

            initialize: function(options) {
            	this._filters = {resultId : options.resultId};
                KendoGridView.prototype.initialize.apply(this, arguments);
                this.loadPlugin('actions');
                this.loadPlugin('rowSelection');
                this.loadPlugin('multiSelection');
            },

            _scrollable: true,
            
            _serverSorting: false,
	
            _columns: function() {

            	var columns = [];

            	var locusColumn = this.cb()
	                .field('locus')
	                .title("Locus")
	                .width("120px")
	                .build();
			
	            var genotypeColumn = this.cb()
	                .field('genotype')
	                .title("Genotype")
	                .width("80px")
	                .build();
					
	            var refColumn = this.cb()
	                .field('ref')
	                .title("Ref")
	                .width("80px")
	                .build();
				
                var typeColumn = this.cb()
                    .field('type')
                    .title("Type")
				    .width("80px")
                    .build();

                var genesColumn = this.cb()
                    .field('genes')
                    .width("150px")
                    .title("Genes")
                    .build();

                var dbSNPColumn = this.cb()
                    .field('dbSNP')
                    .title("dbSNP")
                    .width("300px")
                    .build();
		
                var dgvColumn = this.cb()
                    .field('dgv')
                    .width("100px")
                    .title("DGV")
                    .build();
                
                var mafColumn = this.cb()
                	.field('maf')
                	.width('100px')
                	.title("maf")
                	.build();

                var emafColumn = this.cb()
	            	.field('emaf')
	            	.width('100px')
	            	.title("emaf")
	            	.build();
                
                var amafColumn = this.cb()
	            	.field('amaf')
	            	.width('100px')
	            	.title("amaf")
	            	.build();
                
                var gmafColumn = this.cb()
	            	.field('gmaf')
	            	.width('100px')
	            	.title("gmaf")
	            	.build();
                
                var ucscCommonSNPsColumn = this.cb()
	            	.field('ucscCommonSNPs')
	            	.width('100px')
	            	.title("ucscCommonSNPs")
	            	.build();
                
				columns.push(locusColumn);
				columns.push(genotypeColumn);
				columns.push(refColumn);
				columns.push(typeColumn);
				columns.push(genesColumn);
				columns.push(dbSNPColumn);
				columns.push(dgvColumn);
				columns.push(mafColumn);
				columns.push(emafColumn);
				columns.push(amafColumn);
				columns.push(gmafColumn);
				columns.push(ucscCommonSNPsColumn);

		        return columns;
            }

        });

        return PopulationGridView;

    }
);
