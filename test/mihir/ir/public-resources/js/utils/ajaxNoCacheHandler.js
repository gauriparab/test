/* global define:false */
define(['jquery'], function ($) {
    'use strict';

    var nonce = $.now();

    // append some globally unique parameter to ajax call
    return function(event, xhr, settings) {
        settings.url += ( /\?/.test(settings.url) ? '&' : '?' ) + "_=" + nonce++;
    };
});
