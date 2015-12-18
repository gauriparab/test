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

        var FusionGridView = KendoGridView.extend({

            _url: '/ir/secure/api/data/fusionClinicalDetails',

            _model: VariantDetection,

            initialize: function(options) {
            	this.resultId=options.resultId;
            	this.mode=options.mode;
            	this.classifications=options.classifications;
            	this.showClassification=options.showClassification;
            	this._filters = {resultId : options.resultId};
                KendoGridView.prototype.initialize.apply(this, arguments);
                this.loadPlugin('actions');
            },

            events: {
                'change select[name=classifications]': '_onClassificationChange'
            },

            _scrollable: true,

            _serverSorting: false,

            _serverPaging: false,

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
	                .title($.t('variant.table.driverGene'))
	                //.template("<a href='javascript:void(0)' data-action='view_annotationSources'>#= geneSymbol #</a>")
	                .build();

	            var displayName = this.cb()
	                .field('displayName')
	                .title($.t('variant.table.displayName'))
	                .build();

	            var testResultColumn = this.cb()
	                .field('testResult')
	                .title($.t('variant.table.testResult'))
	                .build();

	            /* var fdaApprovedDrugColumn = this.cb()
	                .field('fdaApprovedDrug')
	                .title($.t('variant.table.fdaApprovedDrug'))
	                .build();*/

	            var locusColumn = this.cb()
	                .field('locus')
	                .title($.t('variant.table.locus'))
	                .build();

	            /*var typeColumn = this.cb()
	                .field('type')
	                .title($.t('variant.table.type'))
	                .build();*/

	            var readCountColumn = this.cb()
	                .field('readCounts')
	                .title($.t('variant.table.readCount'))
	                .build();

              var normalizedReadCountColumn = this.cb()
                  .field('normalizedReadCount')
                  .title($.t('variant.table.normalizedReadCount'))
                  .build();

              var imbalanceColumn = this.cb()
                  .field('imbalanceScore')
                  .title($.t('variant.table.imbScore'))
                  .build();


              	if(this.showClassification){
	            	//columns.push(classifications);
	            }
              		columns.push(geneSymbol);
				    columns.push(displayName);
				    columns.push(readCountColumn);
				    columns.push(normalizedReadCountColumn);
				    columns.push(imbalanceColumn);
				    columns.push(testResultColumn);
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

        return FusionGridView;

    }
);
