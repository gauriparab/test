/*global define:false*/
define([
    'views/common/grid/kendoGridView'
], function(
    KendoGridView
) {
    'use strict';

    var AnalysisAuditLogGridView = KendoGridView.extend({
        _serverSorting: false,

        _sort: [{
            field: "occurredOn",
            dir: "desc"
        }],

        initialize: function(options) {
            KendoGridView.prototype.initialize.apply(this, arguments);

            options = options || {};
            this._events = options.events;
        },

        _columns: function() {
            return [
                {
                    field: "occurredOn",
                    title: "Date",
                    sortable: true,
                    template: "#= (occurredOn == null) ? ' ' : kendo.toString(new Date(Date.parse(occurredOn)),'MMM dd yyyy hh:mm tt') #"
                },
                {
                    field: "performedBy.email",
                    title: "User",
                    sortable: true
                },
                {
                    field: "action",
                    title: "Action",
                    sortable: true,
                    template: "#=  $.t('analysis.auditLog.event.' + action) #"
                },
                {
                    field: "description",
                    title: "Detail",
                    sortable: false
                }
            ];
        },

        _dataSourceConfig: function() {
            return {
                schema: {
                    model: {
                        fields: {
                            occurredOn: {
                                type: "string"
                            },
                            action: {
                                type: "string"
                            },
                            description: {
                                type: "string"
                            }
                        }
                    }
                },
                serverPaging: false,
                pageSize: 20,
                groupable: false,
                scrollable: false,
                pageable: {
                    pageSizes: [ 10, 20, 30, 50, 100 ]
                },
                data: this._events
            };
        }
    });

    return AnalysisAuditLogGridView;

});