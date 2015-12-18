/*global define:false*/
define([
    'jquery',
    'underscore',
    'handlebars',
    'kendo'
].concat(
    'bootstrap.modal',
    'bootstrap.modalmanager'
), function(
    $,
    _,
    Handlebars,
    kendo
) {
    'use strict';

    var Event = {
        RENDERED: 'rendered'
    };

    /**
     * Installs modal behavior on some Backbone.View subclass.
     *
     * Invoke this as:
     * new ModalViewPlugin(ViewClass, { ... options ... }))
     */
    var ModalViewPlugin = kendo.Class.extend({
        /**
         * Base modal options
         *
         */
        _modalOptions: {
            backdrop: 'static',
            attentionAnimation: null,
            keyboard: false,
            show: true
        },

        /**
         * Template of a modal
         *
         */
        _modalTemplate: Handlebars.compile(
            '<div class="modal-header">' +
                '<button type="button" class="close" data-dismiss="modal"> x </button>' +
                '<h3>{{title}}</h3>' +
            '</div>' +
            '<div class="modal-body">' +
                '{{{body}}}' +
            '</div>'
        ),

        /**
         * Constructor
         *
         * @param View
         * @param options
         */
        init: function(View, options) {
            this._options = options;

            View._modal = this;

            _.each([ 'open' ], function(method) {
                View[method] = this['_'+method];
            }, this);
        },

        /**
         * Launch the caller view in a modal.
         *
         * @param viewOptions
         * @private
         */
        _open: function(viewOptions) {
            var self = this,
                modal = this._modal,
                instance = this._instance = new this(viewOptions);

            instance
                .$el
                .html(modal._modalTemplate(_.extend({
                    body: instance.render().$el.html()
                }, modal._options, viewOptions)))
                .addClass('modal')
                .modal(_.extend({}, modal._modalOptions, modal._options));

            instance.$el.on('hidden', _.bind(modal._onHidden, self));

            instance.trigger(Event.RENDERED);
        },

        /**
         * Destroy singleton view instance when modal is hidden.
         *
         * @private
         */
        _onHidden: function() {
            if (this._instance) {
                this._instance.remove();
                delete this._instance;
            }
        }
    });

    ModalViewPlugin.Event = Event;

    return ModalViewPlugin;
});