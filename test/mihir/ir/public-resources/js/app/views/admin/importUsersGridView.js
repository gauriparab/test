/*global define:false*/
define([
    'jquery',
    'views/common/grid/kendoGridView'
], function(
    $,
    KendoGridView
) {
    'use strict';

    var Transport = KendoGridView.Transport.extend({
        read: function(options) {
            options.success.call(this, {content: this._grid._batchUsers.get('imported')});
        }
    });

    var ImportUsersGridView = KendoGridView.extend({

        _selectable: false,

        _sortable: false,

        _pageable: false,

        _transportCls: Transport,

        _fields: {
            firstName: {
                type: 'string'
            },
            lastName: {
                type: 'string'
            },
            email: {
                type: 'string'
            },
            workflow: {
                type: 'string'
            },
            plugins: {
                type: 'number'
            },
            errorFlag: {
                type: 'boolean'
            },
            comment: {
                type: 'string'
            }
        },

        setBatchUsers: function(batchUsers) {
            this._batchUsers = batchUsers;
        },

        _columns: function() {
            return [
                this.cb()
                    .field('firstName')
                    .title('First Name')
                    .build(),
                this.cb()
                    .field('lastName')
                    .title('Last Name')
                    .build(),
                this.cb()
                    .field('email')
                    .title('Email')
                    .build(),
                this.cb()
                    .title('Import')
                    .width('65px')
                    .template("#= ($.inArray('ROLE_IMPORT', roles) !== -1) ? '<i class=\"icon-ok\"><\\i>' : '' #")
                    .build(),
                this.cb()
                    .title('Analyze')
                    .width('65px')
                    .template("#= ($.inArray('ROLE_ANALYZE', roles) !== -1) ? '<i class=\"icon-ok\"><\\i>' : '' #")
                    .build(),
                this.cb()
                    .title('Report')
                    .width('65px')
                    .template("#= ($.inArray('ROLE_REPORT', roles) !== -1) ? '<i class=\"icon-ok\"><\\i>' : '' #")
                    .build(),
                this.cb()
                    .title('Admin')
                    .width('65px')
                    .template("#= ($.inArray('ROLE_ORGADMIN', roles) !== -1) ? '<i class=\"icon-ok\"><\\i>' : '' #")
                    .build(),
            ];
        }
    });

    return ImportUsersGridView;
});
