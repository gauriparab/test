/* global define:false */
define([
    'jquery',
    'underscore',
    'models/admin/irSystemServiceModel',
    'views/common/grid/kendoGridView',
    'views/common/bannersView',
    'hb!templates/admin/grid-column-service-action.html',
    'hb!templates/admin/grid-download-servicelog-action.html'
], function(
    $,
    _,
    IRSystemServiceModel,
    KendoGridView,
    BannerView,
    serviceActionTemplate,
    downloadServiceLogTemplate
) {
    'use strict';
    
    var VALID_ACTIONS = ['START', 'STOP', 'RESTART'];
    
    var ServicesGridView = KendoGridView.extend({

        _model: IRSystemServiceModel,
        
        _url : '/ir/secure/api/v40/irServices',

        _fields: {
            name: {
                type: 'string'
            },
            status: {
                type: 'string'
            },
            actions: {
                type: 'string'
            },
            log: {
                type: 'string'
            }
        },

        events: {
            'click tbody td button[data-coltype=serviceAction]': '_invokeServiceAction'
        },

        _columns: function() {
            return [
                this.cb()
                    .field('name')
                    .title('Name')
                    .template('#= name #')
                    .build(),
                this.cb()
                    .field('status')
                    .title('Status')
                    .template('#= $.t("IRSystemService." + status) #')
                    .build(),
                this.cb()
                    .field('actions')
                    .title('Actions')
                    .template(this._displayActions)
                    .build(),
                this.cb()
                    .field('log')
                    .title('Log')
                    .sortable(false)
                    .template(this._downloadServiceLogAction)
                    .hidden(true)
                    .build()
            ];
        },

        _displayActions: function(dataItem) {
            return serviceActionTemplate({allowedActions: _.intersection(dataItem.allowedActions, VALID_ACTIONS)});
        },
        
        _downloadServiceLogAction: function(dataItem) {
            if (_.contains(dataItem.allowedActions, 'EXPORT_LOG')) {
                return downloadServiceLogTemplate(dataItem);
            } else {
                return '';
            }
        },
        
        _invokeServiceAction: function(e) {
            var row = $(e.currentTarget).closest('tr'),
                action = $(e.currentTarget).data('serviceAction'),
                serviceItem = this._toModel($(e.currentTarget));
            
            serviceItem.invokeServiceAction(action, {
                error: _.bind(this._onInvokeActionError, this, row, serviceItem, action.toLowerCase()),
                success: _.bind(this._onInvokeActionSuccess, this, row, serviceItem, action.toLowerCase())
            });

        },
        
        _onInvokeActionError: function(row, serviceItem, action) {
            new BannerView({
                id: 'error-banner',
                container: $('.main-content>.container-fluid'),
                style: 'error',
                title: $.t('systemService.action.error', {
                    name: serviceItem.get('name'), 
                    action: $.t('action.' + action + '.message') 
                })
            }).render();

        },

        _onInvokeActionSuccess: function(row, serviceItem, action, data) {
            var rowData = this._toItem(row);

            rowData.set('status', data.status);
            rowData.set('allowedActions', data.allowedActions);

            new BannerView({
                id: 'success-banner',
                container: $('.main-content>.container-fluid'),
                style: 'success',
                title: $.t('systemService.action.success', {
                    name: serviceItem.get('name'), 
                    action: $.t('action.' + action + '.message') 
                })
            }).render();

        } 
    });
    
    return ServicesGridView;
});
