/*global define:false*/
define([
    'underscore',
    'models/analysis/batchAnalysisError',
    'views/common/grid/kendoGridView'
].concat(
    'views/common/grid/plugins/rowSelectionGridPlugin'
), function(
    _,
    BatchAnalysisError,
    KendoGridView
) {
    'use strict';

    var Transport = KendoGridView.Transport.extend({
        read: function(options) {
            var batchAnalysesError = this._grid._batchAnalysis.get('unlaunchables').map(function(error) {
                return error.toJSON();
            });
            options.success.call(this, {content: batchAnalysesError});
        }
    });

    var BatchAnalysesUploadErrorsGridView = KendoGridView.extend({

        _model: BatchAnalysisError,

        _fields: {
            lineNumber: {
                type: 'number'
            },
            line: {
                type: 'string'
            }
        },

        _pageable: false,

        _id: 'lineNumber',

        _transportCls: Transport,

        initialize: function() {
            KendoGridView.prototype.initialize.apply(this, arguments);
            this.loadPlugin('rowSelection');
        },

        _columns: function() {
            return [
                this.cb()
                    .field('lineNumber')
                    .title('Line number')
                    .sortable(false)
                    .template('#= lineNumber #')
                    .build(),
                this.cb()
                    .field('line')
                    .title('Line')
                    .sortable(false)
                    .template('#= lineContent #')
                    .build()
            ];
        },
        
        findSelectedItemById: function(itemId) {
            return this._selectedItems.findWhere({'lineNumber': itemId});
        },

        setBatchAnalysis: function(batchAnalysis) {
            this._batchAnalysis = batchAnalysis;
        }

    });
    
    return BatchAnalysesUploadErrorsGridView;
});
