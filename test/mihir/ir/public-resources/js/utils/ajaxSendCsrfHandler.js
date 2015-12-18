/* global define:false */
define(["jquery", "underscore", "global"], function ($, _, global) {

    "use strict";

    /**
     * Determine whether the provided URL is local to IR. We don't want to send the CSRF token to other sites.
     *
     * @param {string} url to check
     * @returns {boolean} if the URL is appropriate for sending the CSRF token
     */
    function isLocalUrl(url) {
        // Parse the link using the built-in DOM method - http://stackoverflow.com/a/18660968
        var linkElement = $(document.createElement("a")).attr("href", url);
        return linkElement[0].host === '' || linkElement[0].host === location.host;
    }

    function doesHttpMethodModifyData(httpMethod) {
        if (typeof httpMethod === "undefined") {
            httpMethod = "";
        }
        httpMethod = httpMethod.toLowerCase();

        return _.indexOf(["post", "delete", "put", "patch"], httpMethod) !== -1;
    }

    var ajaxSendCsrfHandler = function (event, jqXHR, settings) {
        if (isLocalUrl(settings.url) && doesHttpMethodModifyData(settings.type)) {
            jqXHR.setRequestHeader("X-IonReporter-CSRF-Token", global.csrfToken);
        }
    };

    return {
        ajaxSendCsrfHandler: ajaxSendCsrfHandler
    };
});