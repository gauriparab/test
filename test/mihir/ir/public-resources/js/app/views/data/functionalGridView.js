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

        var FunctionalGridView = KendoGridView.extend({

            _url: '/ir/secure/api/data/functionalAnnotation',

            _model: VariantDetection,

            initialize: function(options) {
            	this._filters = {resultId : options.resultId};
                KendoGridView.prototype.initialize.apply(this, arguments);
                this.loadPlugin('actions');
                this.loadPlugin('rowSelection');
                this.loadPlugin('multiSelection');
            },

            _scrollable: true,
	
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
                    .width("200px")
                    .title("Genes")
                    .build();

                var strandColumn = this.cb()
                    .field('strand')
                    .title("Strand")
                    .width("140px")
                    .build();
		
                var transcriptColumn = this.cb()
                    .field('transcript')
                    .width("300px")
                    .title("Transcript")
                    .build();
                
                var codingColumn = this.cb()
                	.field('coding')
                	.width('200px')
                	.title("Coding")
                	.build();

                var aminoAcidChangeColumn = this.cb()
	            	.field('aminoAcidChange')
	            	.width('200px')
	            	.title("AminoAcidChange")
	            	.build();
                
                var variantEffectColumn = this.cb()
	            	.field('variantEffect')
	            	.width('100px')
	            	.title("Variant Effect")
	            	.build();
                
                var siftColumn = this.cb()
	            	.field('sift')
	            	.width('100px')
	            	.title("Sift")
	            	.build();
                
                var granthamColumn = this.cb()
	            	.field('grantham')
	            	.width('100px')
	            	.title("Grantham")
	            	.build();
                
                var polyPhenColumn = this.cb()
	            	.field('polyPhem')
	            	.width('100px')
	            	.title("PolyPhen")
	            	.build();
                
				columns.push(locusColumn);
				columns.push(genotypeColumn);
				columns.push(refColumn);
				columns.push(typeColumn);
				columns.push(genesColumn);
				columns.push(strandColumn);
				columns.push(transcriptColumn);
				columns.push(codingColumn);
				columns.push(aminoAcidChangeColumn);
				columns.push(variantEffectColumn);
				columns.push(siftColumn);
				columns.push(granthamColumn);
				columns.push(polyPhenColumn);

		        return columns;
            }

        });

        return FunctionalGridView;

    }
);
