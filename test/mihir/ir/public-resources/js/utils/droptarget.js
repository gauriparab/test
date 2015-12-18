/*global define:false*/
define([ 'jquery',
         'underscore',
         'kendo' ],
    function($,
             _,
             kendo) {
        'use strict';

        /**
         * Decorator object to make some element a drop target.
         *
         * @type {*}
         */
        var DropTarget = kendo.Class.extend({
            _handlerMap: {
                onDragEnter: 'dragenter',
                onDragLeave: 'dragleave',
                onDrop: 'drop'
            },

            init: function(options) {
                var self = this,
                    opts = options || {},
                    kendoOpts = {};

                this.el = opts.el instanceof $ ? opts.el : $(opts.el);

                // wrap any handlers received and map them to matching kendo callbacks
                _.each(_.keys(this._handlerMap), function(handlerName) {
                    var handler = opts[handlerName];
                    if (_.isFunction(handler)) {
                        kendoOpts[self._handlerMap[handlerName]] = function(e) {
                            var dropTarget = $(e.dropTarget),
                                dragTarget = $(e.draggable.currentTarget);
                            handler(dropTarget, dragTarget);
                        };
                    }
                });

                this.el.kendoDropTarget(_.extend(kendoOpts, opts));
            }
        });

        return DropTarget;
    }
);

