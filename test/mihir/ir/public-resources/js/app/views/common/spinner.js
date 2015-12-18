/*global define:false*/
define([ 'jquery' ],
    function($) {
        'use strict';

        return {
            show: function(el) {
                var spinner = $('<span></span>').addClass('icon-loader');
                el.html($('<div></div>').addClass('row-fluid text-center').append(spinner));
            }
        };
    }
);
