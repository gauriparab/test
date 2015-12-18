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

        var OntologiesGridView = KendoGridView.extend({

            _url: '/ir/secure/api/data/ontologiesAnnotation',
            
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
	                .width("200px")
	                .title("Genes")
	                .build();

                var cosmicColumn = this.cb()
                    .field('cosmic')
                    .width('100px')
                    .title("Cosmic")
                    .build();
		
                var omimColumn = this.cb()
                    .field('omim')
                    .width('150px')
                    .title("Omim")
                    .build();
                
                var geneOntologyColumn = this.cb()
                	.field('geneOntology')
                	.width('200px')
                	.title("Gene Ontology")
                	.build();

                var variantTypeColumn = this.cb()
	            	.field('variantType')
	            	.width('200px')
	            	.title("Variant Type")
	            	.build();
                
                var variantClassColumn = this.cb()
	            	.field('variantClass')
	            	.width('200px')
	            	.title("Variant Class")
	            	.build();
                
				columns.push(locusColumn);
				columns.push(genotypeColumn);
				columns.push(refColumn);
				columns.push(typeColumn);
				columns.push(genesColumn);
				columns.push(cosmicColumn);
				columns.push(omimColumn);
				columns.push(geneOntologyColumn);
				columns.push(variantTypeColumn);
				columns.push(variantClassColumn);

		        return columns;
            }

        });

        return OntologiesGridView;

    }
);
