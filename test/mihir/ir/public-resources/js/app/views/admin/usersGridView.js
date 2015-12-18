/* global define:false */
define(['jquery',
        'underscore',
        'kendo',
        'models/admin/userModel',
        'views/common/grid/kendoGridView',
        'hb!templates/grid/grid-column-name.html',
        'hb!templates/grid/grid-action-users.html'
        ].concat(
        'utils/templateFunctions',
        'views/common/grid/plugins/rowSelectionGridPlugin',
        'views/common/grid/plugins/actionsGridPlugin'),

        function($,
                 _,
                 kendo,
                 UserModel,
                 KendoGridView,
                 gridColumnNameTemplate,
                 userActionsTemplate) {
    'use strict';

    var UsersGridView = KendoGridView.extend({

        _model: UserModel,
        
        _url : '/ir/secure/api/user/getAllUsers',
        
        events: {
            'click tr a[data-action]' : '_onExecutePrimaryAction'
        },

        _fields: {
            userName : {
                type : 'string'
            },
            firstName : {
                type : 'string'
            },
            lastName : {
                type : 'string'
            },
            middleName : {
                type : 'string'
            },
            email : {
                type : 'string'
            },
            rdxState : {
                type : 'string'
            },
            lastLoginDate : {
                type : 'string'
            }
        },

        sort: [{
            field : 'lastName',
            dir : 'asc'
        }],

        initialize: function() {
            KendoGridView.prototype.initialize.apply(this, arguments);
            this.loadPlugin('actions');
            this.loadPlugin('rowSelection');
        },

        _columns: function() {
            return [{
                field : "userName",
                title : $.t('grid.header.label.username'),
                sortable : true,
                template: gridColumnNameTemplate.withFilter(function(ctx) {
                    var user = new UserModel(ctx.toJSON());
                    return _.extend(ctx, {
                        name: user.get('userName'),
                        primaryAction: 'view_details'
                    });
                })
            }, {
                field : "firstName",
                title : $.t('grid.header.label.firstName'),
                sortable : true
            }, {
                field : "lastName",
                title : $.t('grid.header.label.lastName'),
                sortable : true
            }, {
                field : "rdxState",
                title : $.t('grid.header.label.status'),
                width : '185px',
                sortable : false
            }, {
                field : "signature",
                title : $.t('grid.header.label.signature'),
                sortable : false
            }, {
                field : "roleName",
                title : $.t('grid.header.label.role'),
                sortable : false,
                template: gridColumnNameTemplate.withFilter(function(ctx) {
                    var user = new UserModel(ctx.toJSON());
                    user= user.toJSON();
                    return _.extend(ctx, {
                       name: user.roleDto,
                       primaryAction: null
                    });
                })
            }];

        }

    });
    
    return UsersGridView;
});