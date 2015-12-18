/* global define:false */
define(['jquery',
    'underscore',
    'backbone'],
    function($,
             _,
             Backbone) {

        'use strict';

        /**
         * A Backbone view that renders the specified URL in an iframe
         *
         * @type {*}
         */
        var IFrameView = Backbone.View.extend({

            tagName: 'iframe',

            /**
             * Constructor
             *
             * @param options
             */
            initialize: function(options) {
                options = options || {};
                if (options.url) {
                    this.setURL(options.url);
                }
            },

            setURL: function(url) {
                this._location = this._parseURL(url);
            },

            /**
             * Custom events
             *
             */
            delegateEvents: function() {
                Backbone.View.prototype.delegateEvents.apply(this, arguments);
                $(window).on('message', _.bind(this._onMessage, this));
                this.$el.on('load', _.bind(this._postComplete, this));
                this.$el.on('load', _.bind(this._adjustWindowHeight, this));
            },

            /**
             * Undelegation hook
             *
             */
            undelegateEvents: function() {
                $(window).off('message');
                Backbone.View.prototype.undelegateEvents.apply(this, arguments);
            },

            render: function() {
                this.$el.attr('src', this._location.href);
                return this;
            },

            _postComplete: function() {
                this.trigger('loading:complete');
            },

            // IR-6304: in FF the iframe height was not adjusting to height of the content
            _adjustWindowHeight: function() {
                if (this.$el[0].contentWindow && this.$el[0].contentWindow.$) { //ensure Jquery is loaded
                    this.$el.height(this.$el[0].contentWindow.document.body.scrollHeight);
                }
            },

            /**
             * Post a message to the iframe
             *
             * @param eventType
             * @param data
             */
            message: function(eventType, data, origin) {
                this.el.contentWindow.postMessage(_.extend(data, {
                    eventType: eventType
                }), origin || '*');
            },

            /**
             * Handler for messages received from iframe
             *
             * @param e
             * @private
             */
            _onMessage: function(e) {
                e.preventDefault();
                if (e.originalEvent.data) {
                    var data = e.originalEvent.data,
                        origin = e.originalEvent.origin;
                    this.trigger(data.eventType, data, origin);
                }
            },

            /**
             * Handy for JS parsing a URL
             *
             * @param url
             * @returns {HTMLElement}
             * @private
             */
            _parseURL: function(url) {
                var a = document.createElement('a');
                a.href = url;
                return a;
            }

        });

        return IFrameView;
    }
);

