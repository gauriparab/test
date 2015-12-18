/*global define:false*/
define([
    'jquery',
    'models/specimen',
    'views/common/grid/kendoGridView',
    'hb!templates/grid/grid-column-date.html'
].concat(
    'utils/templateFunctions'
), function(
    $,
    Specimen,
    KendoGridView,
    dateColumnTemplate
) {
    'use strict';

    var SampleAuditLogGridView = KendoGridView.extend({

        _baseUrl: '/ir/secure/api/v40/sampleAuditLogs/',

        _model: Specimen,

        _fields: {
            date: {
                type: 'date'
            },
            user: {
                type: 'string'
            },
            action: {
                type: 'string'
            },
            detail: {
                type: 'string'
            }
        },

        initialize: function (options) {
            this._url = this._baseUrl + this.model.get('id');
            KendoGridView.prototype.initialize.call(this, options);
        },

        _columns: function () {
            return [{
                field: 'date',
                title: 'Date',
                sortable: false,
                template: dateColumnTemplate.forField('occurredOn')
            }, {
                field: 'user',
                title: 'User',
                sortable: false,
                template: ' #= data.performedBy.firstName + " " + ' +
                    '( data.performedBy.middleName ? data.performedBy.middleName : \'\') + ' +
                    ' " " + data.performedBy.lastName # '
            }, {
                field: 'action',
                title: 'Action',
                sortable: false,
                template: ' #= data.action # '
            }, {
                field: 'detail',
                title: 'Detail',
                sortable: false,
                template: ' #= data.description # '
            }];
        }

    });

    return SampleAuditLogGridView;
});
