/* global define:false*/
define(['jquery', 'global', 'handlebarHelper', 'kendo.grid.override', 'i18n', 'bootstrap', 'iso8601', 'modules/idleTimeout',
    'modules/browserWarning', 'domready', 'ajaxError', 'utils/ajaxSendCsrfHandler', 'utils/ajaxNoCacheHandler',
    'views/messages/messagesView'],

    function($, global, handlebarHelper, kendoInit, i18n, bootstrap, iso8601, idleTimeout, browserWarning, domReady,
             AjaxError, ajaxSendCsrfHandler, ajaxNoCacheHandler, MessagesView) {

        'use strict';

        $(document).ajaxSend(ajaxSendCsrfHandler.ajaxSendCsrfHandler);
        $(document).ajaxSend(ajaxNoCacheHandler);

        handlebarHelper.initialize(global.rootcontext, global.resources);
        // 'unspecific' means we don't have en-us, en-gb, en-ca (country specific) language resources.
        // this saves us from returning the same translation for en and en-us
        //var language = localStorage.getItem('ionUserLanguage');
        var language = $.cookie('i18next') || 'en-US';
        var option = {
            resGetPath: '/ir/locales/'+language+'/messages',
            dynamicLoad: true,
            fallbackLng: 'en-US',
            load: 'current',
            lng:language,
            getAsync: false,
            cookieDomain: '/ir'
        };
        $.i18n.init(option, function() {
            // Any code in this function is executed
            // after i18n has finished loading

            idleTimeout.initialize();
        });

        domReady(function() {
            browserWarning.initialize();

            // handle ajax errors globally using the banner view.
            $(document).ajaxError(function(event, jqxhr, settings) {
                var ajaxSettings = settings || {};

                if (jqxhr.status > 400 && ajaxSettings.noGlobalErrorHandler !== true) {
                    AjaxError.showGlobalError(jqxhr);
                }
            });

            MessagesView.show();
        });

    });
