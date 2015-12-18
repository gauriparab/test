/*global define:false*/
define([
    'jquery',
    'underscore',
    'kendo',
    'views/common/grid/kendoGridView',
    'models/referenceGenome'
].concat(
	    'utils/templateFunctions',
	    'views/common/grid/plugins/actionsGridPlugin'
	), function(
    $,
    _,
    kendo,
    KendoGridView,
    DnaBarcode) {

    'use strict';

    /**
     * A re-usable attributes grid view
     *
     * @type {*}
     */
    var ReferenceGenomeGridView = KendoGridView.extend({

        _url: '/ir/secure/api/samplemanagement/samples/getDistinctBarcodes',

        _model: DnaBarcode,

        _sort: [{
            field : 'createdOn',
            dir : 'desc'
        }],

        initialize: function(options) {
            KendoGridView.prototype.initialize.apply(this, arguments);
            this.loadPlugin('actions');
        },

        _columns: function() {

        	var nameColumn = this.cb()
	            .field('name')
	            .title($.t('grid.column.name'))
	            .template('<b><a href="javascript:void(0)" data-action="view_AllBarcode">#= (name != 0) ? name : "" #</a></b>')
	            .build();

	        var statusColumn = this.cb()
	            .field('state')
	            .title($.t('grid.column.status'))
	            .build();

	        return [
	            nameColumn,
	            statusColumn
	        ];

        }

    });

    return ReferenceGenomeGridView;

});
