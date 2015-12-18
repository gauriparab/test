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

            _url: '/ir/secure/api/data/fusionVariantByFilter',

            _model: VariantDetection,

            events: {
                'change select[name=classifications]': '_onClassificationChange'
            },

            initialize: function(options) {
            	this.resultId=options.resultId;
            	this.mode=options.mode;
            	this._filters = {resultId : this.resultId};
            	this.classifications=options.classifications;
                KendoGridView.prototype.initialize.apply(this, arguments);
                this.loadPlugin('actions');
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

	            var displayName = this.cb()
	                .field('displayName')
	                .title($.t('variant.table.geneIsoform'))
	                .template("<a href='javascript:void(0)' data-action='view_annotationSources'>#= displayName #</a>")
	                .build();

              var driverGeneColumn = this.cb()
                  .field('driverGene')
                  .title($.t('variant.table.driverGene'))
                  .build();

              var typeColumn = this.cb()
                  .field('type')
                  .title($.t('variant.table.type'))
                  .build();

              var normalizedReadCountColumn = this.cb()
                  .field('normalizedReadCount')
                  .title($.t('variant.table.normalizedReadCount'))
                  .build();

              var imbalanceColumn = this.cb()
                  .field('imbalanceScore')
                  .title($.t('variant.table.imbScore'))
                  .build();

	            var readCountColumn = this.cb()
	                .field('readCounts')
	                .title($.t('variant.table.readCount'))
	                .build();

	            var testResultColumn = this.cb()
	                .field('testResult')
	                .title($.t('variant.table.testResult'))
	                .build();

	            var locusColumn = this.cb()
	                .field('locus')
	                .title($.t('variant.table.locus'))
	                .build();


	            if(this.mode !== 'dx')
	            	columns.push(classifications);
        				columns.push(displayName);
                columns.push(driverGeneColumn);
                columns.push(typeColumn);
        				columns.push(readCountColumn);
                columns.push(normalizedReadCountColumn);
                columns.push(imbalanceColumn);
        				columns.push(testResultColumn);
        				columns.push(locusColumn);
        		    return columns;
            },

            _onClassificationChange: function(e) {
                var variant = this._toItem(e.currentTarget);
                var newClassification=$(e.currentTarget).val();
                var self = this;
                $.ajax({
                    url: '/ir/secure/api/data/updateVariant?resultId='+self.resultId+'&locus='+variant.locus+'&classification='+$(e.currentTarget).val()+'&chromosome='+variant.chrom+'&position='+variant.position,
                    type:'GET',
                    contentType: 'application/json',
                });
                var data= this.$el.data('kendoGrid').dataSource.data();
                var noOfRecords=data.length;
                for(var i=0; i<noOfRecords ; i++) {
            		if(data[i].locus==variant.locus) {
            			data[i].classification=data[i].selectedClassification=newClassification;
            		}
            	}
                this.$el.data('kendoGrid').dataSource.data(data);
            }

        });

        return FusionGridView;

    }
);
