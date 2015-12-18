/*global define:false*/
define([
    'jquery',
    'underscore',
    'views/workflows/presetsGridView',
    'models/annotationSet',
    'hb!templates/grid/annotationSet/grid-column-status.html'
], function(
    $,
    _,
    PresetsGridView,
    AnnotationSet,
    gridColumnStatusTemplate
) {
    'use strict';

    /**
     * A re-usable annotationSet grid view
     *
     * @type {*}
     */
    var AnnotationSetPresetsGridView = PresetsGridView.extend({

        _url: '/ir/secure/api/v40/annotationsets',

        _model: AnnotationSet,

        _fields: _.extend({}, PresetsGridView.prototype.fields, {
            sources: {
                type: 'array'
            }
        }),

        _columns: function() {
            return [
                this._statusColumn(),
                this._factoryProvidedColumn(),
                this._nameColumn(AnnotationSet),
                this._applicationVersionColumn(),
                this._createdByColumn(),
                this._createdOnColumn(),
                {
                    field: 'status',
                    title: 'Status',
                    sortable: true,
                    template: gridColumnStatusTemplate
                }
            ];
        }

    });

    return AnnotationSetPresetsGridView;
});
