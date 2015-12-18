/*global define:false*/
define([
    'views/common/grid/kendoGridView',
    'models/variantDetection',
    'hb!templates/grid/grid-classifications.html'
].concat(
    'utils/templateFunctions',
    'views/common/grid/plugins/actionsGridPlugin'),

    function(
             KendoGridView,
             VariantDetection,
             classificationsTemplate){

        'use strict';

        var CnvGridView = KendoGridView.extend({

            _url: '/ir/secure/api/data/targetCnvVariantsByFilter',

            _model: VariantDetection,

            initialize: function(options) {
            	this.resultId=options.resultId;
            	this.mode=options.mode;
            	this._filters = {resultId : this.resultId};
            	this.classifications=options.classifications;
            	this.showClassification=options.showClassification;
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
	                .title($.t('variant.table.geneSymbolFull'))
	                .template("<a href='javascript:void(0)' data-action='view_annotationSources'>#= geneSymbol #</a>")
	                .build();

            	var displayName = this.cb()
            		.field('targetCnvDisplayName')
            		.title($.t('variant.table.displayName'))
            		.build();

            	var locusColumn = this.cb()
	                .field('locus')
	                .title($.t('variant.table.locus'))
	                .build();

	            var copyNumberColumn = this.cb()
	                .field('copyNumber')
	                .title($.t('variant.table.copyNumber'))
	                .build();

	            var cnvConfidenceColumn = this.cb()
	                .field('cnvConfidence')
	                .title($.t('variant.table.cnvConfidence'))
	                .build();

              var cnvTilesColumn = this.cb()
	                .field('tiles')
	                .title($.t('variant.table.cnvTiles'))
	                .build();

	            if(this.showClassification){
	            	columns.push(classifications);
	            }
	            columns.push(geneSymbol);
	            columns.push(displayName);
				columns.push(locusColumn);
				columns.push(copyNumberColumn);
				columns.push(cnvConfidenceColumn);
        columns.push(cnvTilesColumn);
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

        return CnvGridView;

    }
);
