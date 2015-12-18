/*global define:false*/
define([ 'jquery',
         'kendo' ],
    function($,
             kendo) {
        'use strict';

        /**
         * Decorator object to make some element draggable.
         *
         * @type {*}
         */
        var Draggable = kendo.Class.extend({
            init: function(options) {
                var opts = options || {};
                this.el = opts.el instanceof $ ? opts.el : $(opts.el);
                this.el.kendoDraggable(opts);
            }
        });

        return Draggable;
    }
);

