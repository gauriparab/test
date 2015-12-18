/*global define:false*/
define([ 'jquery', 'utils/browserDetector', 'hb!templates/browser-warning.html', 'jqCookie' ],
    function ($, defaultBrowserDetector, browserWarningTemplate) {

    "use strict";

    var COOKIE_NAME = "hideBrowserWarning",
        BROWSER_WARNING_VISIBLE_CLASS = "browser-warning-visible";

    var defaultNagTimes = 3,
        nagTimes = null,
        browserWarningEl,
        browserDetector;

    var showBrowserWarningBoxIfNeeded = function () {
        var majorVersion = browserDetector.browser.version;
        var dotIndex = majorVersion.indexOf('.');
        if (dotIndex > -1) {
            majorVersion = majorVersion.substring(0, dotIndex);
        }
        majorVersion = parseInt(majorVersion, 10);
        var isUnsupportedBrowser = (browserDetector.browser.mozilla && majorVersion < 8) ||
            (browserDetector.browser.safari && majorVersion < 526) || // less than Safari 4.0
            (browserDetector.browser.webkit && majorVersion < 22) || // Chrome/Blink v22 and below
            (browserDetector.browser.msie && majorVersion < 9) ||
            browserDetector.browser.opera;

        if (isUnsupportedBrowser) {
            var parsedTemplate = $(browserWarningTemplate());
            var bodyEl = $("body");
            browserWarningEl = parsedTemplate.appendTo(bodyEl);
            // Bind to bootstrap close event.
            browserWarningEl.on("click", "button[data-dismiss]", hideBrowserWarningBox);
            bodyEl.addClass(BROWSER_WARNING_VISIBLE_CLASS);
        }
    };

    var hideBrowserWarningBox = function () {
        browserWarningEl.hide();
        $("body").removeClass(BROWSER_WARNING_VISIBLE_CLASS);

        $.cookie(COOKIE_NAME, --nagTimes, { path: '/' });
    };

    return {
        initialize: function (options) {
            var defaults = {
                browserDetector: defaultBrowserDetector
            };
            var settings = $.extend({}, defaults, options);
            browserDetector = settings.browserDetector;

            nagTimes = $.cookie(COOKIE_NAME) !== undefined ? parseInt($.cookie(COOKIE_NAME), 10)
                : defaultNagTimes;

            if (nagTimes > 0) {
                showBrowserWarningBoxIfNeeded();
            }
        }
    };
});
