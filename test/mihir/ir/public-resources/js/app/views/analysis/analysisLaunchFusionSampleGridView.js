/*global define:false*/
define([
    'jquery',
    'models/sample/attribute',
    'models/specimen',
    'views/analysis/analysisLaunchSampleGridView',
    'hb!templates/grid/grid-column-analyzed.html',
    'hb!templates/grid/grid-column-checkbox.html',
    'hb!templates/grid/grid-column-date.html',
    'hb!templates/grid/grid-column-message.html'
], function(
    $,
    Attribute,
    Sample,
    SampleGridView,
    analyzedColumnTemplate,
    checkBoxColumnTemplate,
    dateColumnTemplate,
    messageColumnTemplate) {

    'use strict';

    var FusionSampleGridView = SampleGridView.extend({

        _columns: function() {
            return [{
                headerTemplate: checkBoxColumnTemplate({}),
                template : checkBoxColumnTemplate
            }, {
                field : 'analyzed',
                width : '40px',
                sortable : true,
                headerTemplate : this.getIconHeader({icon: 'icon-eye-open', title: 'Sample has been analyzed'}),
                template : analyzedColumnTemplate
            }, {
                field : 'name',
                title : 'Sample',
                sortable : true
            }, {
                title : $.t(Attribute.Name.GENDER),
                sortable : false,
                template: messageColumnTemplate.forField('gender').forModel(Sample)
            }, {
                title: $.t(Attribute.Name.TYPE),
                sortable: false,
                template: messageColumnTemplate.forField('type').forModel(Sample)
            }, {
                title : $.t(Attribute.Name.CANCER_TYPE),
                sortable : false,
                template: messageColumnTemplate.forField('cancerType').forModel(Sample)
            }, {
                title : $.t(Attribute.Name.PERCENT_CELLULARITY),
                sortable : false,
                template: messageColumnTemplate.forField('percentCellularity').forModel(Sample)
            }, {
                field : 'createdOn',
                title : 'Imported On',
                sortable : true,
                template : dateColumnTemplate.forField('createdOn')
            }];
        }

    });

    return FusionSampleGridView;

});