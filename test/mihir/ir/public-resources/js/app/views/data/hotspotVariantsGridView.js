/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/variantDetection',
    'hb!templates/grid/grid-classifications.html'
].concat(
    'utils/templateFunctions',
    'views/common/grid/plugins/actionsGridPlugin'),

    function($,
             _,
             kendo,
             KendoGridView,
             VariantDetection,
             classificationsTemplate){

        'use strict';

        var HotspotVariantGridView = KendoGridView.extend({

            _url: '/ir/secure/api/data/hotspotClinical',

            _model: VariantDetection,

            initialize: function(options) {
            	this.resultId=options.resultId;
            	this.showClassification=options.showClassification;
            	this.classifications=options.classifications;
            	this._filters = {resultId : options.resultId};
                KendoGridView.prototype.initialize.apply(this, arguments);
                this.loadPlugin('actions');
            },

            events: {
                'change select[name=classifications]': '_onClassificationChange'
            },

            _scrollable: true,

            _serverPaging: false,

            _serverSorting: false,


            _total: function(response) {
                return $(response.content).length;
            },

            _columns: function() {

            	var columns = [];

            	var self= this;

            	var classifications = this.cb()
                .field('classification')
                .title($.t('variant.table.classifications'))
                .template(classificationsTemplate.withFilter(function(ctx) {
                    var varient = new VariantDetection(ctx.toJSON());
                    return _.extend(ctx, {
                    	selectedClassification: varient.get('classification'),
                    	classifications: self.classifications
                    });
                }))
                .width('160px')
                .build();

                var geneSymbol = this.cb()
                    .field('geneSymbol')
                    .title($.t('variant.table.geneSymbol'))
                    .template("<a href='javascript:void(0)' data-action='view_annotationSources'>#= geneSymbol #</a>")
                    .build();

                var displayName = this.cb()
                    .field('displayName')
                    .title($.t('variant.table.displayName'))
                    .build();

                var testResultColumn = this.cb()
                    .field('testResult')
                    .title($.t('variant.table.testResult'))
                    .build();

                /*var fdaApprovedDrugColumn = this.cb()
	                .field('fdaApprovedDrug')
	                .title($.t('variant.table.fdaApprovedDrug'))
	                .build();*/

                var locusColumn = this.cb()
	                .field('locus')
	                .title($.t('variant.table.locus'))
	                .build();

                /*var chrColumn = this.cb()
                    .field('chr')
                    .title($.t('variant.table.chr'))
                    .build();

                var positionColumn = this.cb()
                    .field('pos')
                    .title($.t('variant.table.position'))
                    .build();*/

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

                if(this.showClassification){
	            	columns.push(classifications);
                }
				columns.push(geneSymbol);
				columns.push(displayName);
				columns.push(hotspotIdColumn);
				columns.push(testResultColumn);
				//columns.push(fdaApprovedDrugColumn);
				columns.push(locusColumn);
				//columns.push(chrColumn);
				//columns.push(positionColumn);
				columns.push(typeColumn);
				columns.push(genotypeColumn);
				columns.push(refColumn);
				columns.push(varFrqColumn);
				columns.push(qualityScoreColumn);
				columns.push(coverageColumn);
		        return columns;
            },

            _onClassificationChange: function(e) {
                var variant = this._toItem(e.currentTarget);
                var self = this;
                $.ajax({
                    url: '/ir/secure/api/data/updateVariant?resultId='+self.resultId+'&locus='+variant.locus+'&classification='+$(e.currentTarget).val()+'&chromosome='+variant.chrom+'&position='+variant.position,
                    type:'GET',
                    contentType: 'application/json',
                });
            }

        });

        return HotspotVariantGridView;

    }
);
