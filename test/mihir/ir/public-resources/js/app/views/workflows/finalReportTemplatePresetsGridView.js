/*global define:false*/
define([
    'jquery',
    'underscore',
    'views/workflows/presetsGridView',
    'models/finalReportTemplate'
], function(
    $,
    _,
    PresetsGridView,
    FinalReportTemplate
) {
    'use strict';

    /**
     * A re-usable presets grid view
     *
     * @type {*}
     */
    var FinalReportTemplatePresetsGridView = PresetsGridView.extend({

        _url : '/ir/secure/api/v40/finalreporttemplates',

        _model : FinalReportTemplate,

        _fields: _.extend({}, PresetsGridView.prototype.fields, {
            sections : {
                type: 'array'
            }
        })

    });

    return FinalReportTemplatePresetsGridView;
});
