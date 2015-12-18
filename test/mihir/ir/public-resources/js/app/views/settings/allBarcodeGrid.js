/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/referenceGenome'
], function(
    $,
    _,
    kendo,
    KendoGridView,
    DnaBarcode) {

    'use strict';
    
	var Transport = kendo.Class.extend({

		_grid : null,

		/**
		 * Constructor
		 * 
		 * @param options
		 */
		init : function(grid) {
			this._grid = grid;
		},

		/**
		 * Method for fetching data
		 * 
		 * @param options
		 */
		read : function(options) {
			$.ajax({
				url : this._grid._url
						+ '?'
						+ $.param(_.extend({}, this
								._parameterMap(options.data),
								this._grid._filters)),
				type : 'GET',
				//data : JSON.stringify(this._grid._filters),
				contentType : 'application/json',
				success : options.success,
				error : options.error
			});
		},

		/**
		 * Convert kendo grid parameters to spring parameters
		 * 
		 * @param options
		 * @returns {Object|*|Mixed}
		 * @private
		 */
		_parameterMap : function(options) {
			return _.reduce(options, function(memo, v, k) {
				switch (k) {
				case 'take':
					memo['page.size'] = v;
					break;
				case 'page':
					memo['page.page'] = v;
					break;
				case 'sort':
					_.each(v, function(sortObj) {
						memo['page.sort'] = sortObj.field;
						memo['page.sort.dir'] = sortObj.dir;
					});
					break;
				}
				return memo;
			}, {});
		}

	});

    /**
     * A re-usable attributes grid view
     *
     * @type {*}
     */
    var ReferenceGenomeGridView = KendoGridView.extend({

        _url: '/ir/secure/api/samplemanagement/samples/getBarcodesByName',

        _model: DnaBarcode,

        _sort: [{
            field : 'name',
            dir : 'desc'
        }],

        initialize: function(options) {
            KendoGridView.prototype.initialize.apply(this, arguments);
            if(options.name){
        		this._filters = { name : options.name};
        	}
        },
        
        _transportCls : Transport,

        _columns: function() {

        	var idColumn = this.cb()
	            .field('idStr')
	            .title($.t('grid.column.name'))
	            .build();

	        var sequenceColumn = this.cb()
	            .field('sequence')
	            .title($.t('grid.column.sequence'))
	            .build();
	
	        return [
	            idColumn,
	            sequenceColumn
	        ];
        
        }

    });

    return ReferenceGenomeGridView;

});
