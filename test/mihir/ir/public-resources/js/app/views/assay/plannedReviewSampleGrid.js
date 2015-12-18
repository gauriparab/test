/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/sample/sampleModel'].concat(
    'utils/templateFunctions'
), 
    function($, _, kendo, KendoGridView, Sample){

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
    	                    this._grid._filters
    	                )),
    	                type: 'GET',
    	                contentType: 'application/json',
    	                success: options.success,
    	                error: options.error
    	            });
    	        },

    	    });

	 var auditTrailGridView = KendoGridView.extend({

            _url: '/ir/secure/api/planrun/getReviewSamples',

           _model: Sample,
	
	    _sort: [{
               field: 'sampleId',
               dir: 'desc'
            }],

	    initialize: function(options) {
	    	this._filters = { expId : options.planId};
            KendoGridView.prototype.initialize.apply(this, arguments);
            this.loadPlugin('actions');

            _.extend(this, _.defaults(options || {}, {
                nameHasAction: true
            }));
        },
        
        _pageable: false,
        
        _transportCls: Transport,
        
	    _columns: function() {

            	var idColumn = this.cb()
                    .field('sampleId')
                    .title($.t('manage.sample.id'))
                    .build();

                var nameColumn = this.cb()
                    .field('sampleName')
                    .title($.t('manage.sample.name'))
                    .build();

                //FIXME change barcodeID to barcode object from backend. curretly putting temp fix in addSampleView.js
                var barcodeColumn = this.cb()
                    .field('barcodeId')
                    .title($.t('manage.sample.barcodeId'))
                    .build();

                var descriptionColumn = this.cb()
                	.field('description')
                    .title($.t('manage.sample.description'))
                    .build();

		 return [
                    idColumn,
                    nameColumn,
                    barcodeColumn,
                    descriptionColumn
                ];
            }

        });

        return auditTrailGridView;
});
