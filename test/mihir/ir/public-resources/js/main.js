/*global define:false, require:false*/
define(['global'], function(global) {

    "use strict";

    require.config({
        urlArgs: 'v=' + global._version,
        baseUrl: global.resources + 'js/',
        paths: {
            jquery: 'lib/jquery-1.9.1.min',
	    jqSortable: 'lib/jquery-ui-1.10.4.sortable.min',
            underscore: 'lib/underscore-1.6.0',
            backbone: 'lib/backbone-min-1.0.0',
            handlebars: 'lib/handlebars-1.0.0',
            kendo: '../kendoui.web.2013.1.319.commercial/js/kendo.web.min',
            text: 'lib/text-2.0.6',
            domready: 'lib/domReady-2.0.1',
            i18n: 'lib/i18next.amd.withJQuery-1.6.2',
            iso8601: 'lib/iso8601',
            bootstrap: 'lib/bootstrap.min',
            'bootstrap.select': 'lib/bootstrap-select.min',
            idletimer: 'lib/idle-timer',
            jqMigrate: 'lib/jquery-migrate-1.2.1.min',
            jqHashChange: 'lib/jquery.ba-hashchange.min',
            jqCookie: 'lib/jquery.cookie.1.3.1',
            'jquery.ui.widget': 'lib/jquery.ui.widget-1.10.3.amd',
            jqIframe: 'lib/jquery.iframe-transport-1.7',
            jqFileUpload: 'lib/jquery.fileupload-5.31.6',
            jqFileDownload: 'lib/jquery.fileDownload-1.4.2',
            'bootstrap.fileupload': 'lib/bootstrap-fileupload',
            'bootstrap.modal': 'lib/bootstrap-modal',
            'bootstrap.modalmanager': 'lib/bootstrap-modalmanager',
            hb: 'hbtemplate',
            templates: 'app/templates',
            modules: 'app/modules',
            models: 'app/models',
            data: 'app/data',
            collections: 'app/collections',
            views: 'app/views',
            events: 'app/events',
            wizard: 'app/wizard',
            routers: 'app/routers',
            igv: 'lib/igv',
            utils: 'utils',
            jBarcode: 'lib/jquery-barcode-2.0.2',
            'bootstrap.datepicker': 'lib/bootstrap-datepicker'
        },

        shim: {
            underscore: {
                exports: '_'
            },

            backbone: {
                deps: [ "underscore", "jquery" ],
                exports: "Backbone"
            },

            handlebars: {
                exports: 'Handlebars'
            },

            kendo: {
                deps : [ "jquery" ],
                exports: "kendo"
            },

            bootstrap: {
                deps: [ "jquery" ],
                exports: "$.fn.popover"
            },

            'bootstrap.select': {
                deps: [ "jquery", "bootstrap" ],
                exports: "$.fn.selectpicker"
            },

            'bootstrap.fileupload': {
                deps: [ "jquery" ]
            },

            'bootstrap.modal': {
                deps: [ "jquery" ]
            },

            'bootstrap.modalmanger': {
                deps: [ "jquery" ]
            },

            'bootstrap.datepicker': {
            	deps: [ "jquery", "bootstrap" ]
            },
            
            idletimer: {
                deps: [ "jquery" ]
            },

            jqMigrate: {
                deps: [ "jquery" ]
            },

            jqHashChange: {
                deps: [ "jquery", "jqMigrate" ]
            },

            jqCookie: {
                deps: [ "jquery" ]
            },

            'jquery.ui.widget': {
                deps: [ "jquery" ]
            },

            jqIframe: {
                deps: [ "jquery" ]
            },

            jqFileUpload: {
                deps: [ "jquery", "jqIframe" ]
            },

            jqFileDownload: {
                deps: [ "jquery" ]
            },
            
            jBarcode: {
                deps : [ "jquery" ]
            }
        }
    });

    require.config({
        urlArgs: 'v=' + global._version,
        paths: {
            'pluginLib': '/ir/plugins/lib/js/',
            deepmodel: '/ir/plugins/lib/js/deep-model.min',
            d3: '/ir/plugins/lib/js/d3/d3.v3',
            'multiviz': '/ir/plugins/multiviz/js',
            serveradapter: '/ir/plugins/multiviz/js/adapter/serveradapter',
            'geneffects': '/ir/plugins/multiviz/geneffects/js',
            'fusion': '/ir/plugins/multiviz/genefusions/js',
            'cnv': '/ir/plugins/multiviz/cnv/js',
            fabric : '/ir/plugins/lib/js/fabric.require',
            /** object for dealing with color scales and legends */
            legend : '/ir/plugins/multiviz/js/legend',
            analysisview : '/ir/plugins/multiviz/js/model/analysisview',
            adapter: '/ir/plugins/multiviz/js/adapter/iradapter'
        },
        shim: {
            d3: {
                deps: [ "jquery" ],
                exports: 'd3'
            },

            deepmodel: {
                deps: [ "underscore", "backbone"]
            }
        }
    });
});
