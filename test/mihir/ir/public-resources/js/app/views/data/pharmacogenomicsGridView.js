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

        var PharmacogenomicsGridView = KendoGridView.extend({

            _url: '/ir/secure/api/data/pharmacogenomicsAnnotation',
            
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

                var clinVarColumn = this.cb()
                    .field('clinVar')
                    .title("clinVar")
                    .width("300px")
                    .build();               
                
				columns.push(locusColumn);
				columns.push(genotypeColumn);
				columns.push(refColumn);
				columns.push(typeColumn);
				columns.push(genesColumn);
				columns.push(clinVarColumn);

		        return columns;
            }

        });

        return PharmacogenomicsGridView;

    }
);
