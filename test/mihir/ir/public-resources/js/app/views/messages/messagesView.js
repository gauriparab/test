/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'views/common/bannersView', 'collections/messages/messageCollection'],

function ($, _, Backbone, BannerView, MessageCollection) {

    'use strict';

    var MAX_RETRIES = 20;

    var MessagesView = Backbone.View.extend({

        initialize: function(options) {
            this.options = options || {};
            this.messages = new MessageCollection();
            var self = this;
            this.messages.fetch({success: function() {
                self.render();
            }});
        },

        render: function() {
            if (this.messages.length === 1) {
                BannerView.show({
                    id: 'user-messages',
                    static: true,
                    sticky: true,
                    container: this.options.container,
                    style: 'info',
                    title: this.messages.at(0).get('message')
                });
            } else if (this.messages.length > 1) {
                BannerView.show({
                    id: 'user-messages',
                    static: true,
                    sticky: true,
                    container: this.options.container,
                    style: 'info',
                    title: '',
                    messages: this.messages.pluck('message')
                });
            }
        }
    });


    MessagesView.show = function(tries) {

        // Why are we re-trying here? The container for the alert div is ".main-content". The backbone views which
        // paint content in this section typically perform a .html(handlebartemplate) replacing it's content with the
        // rendered template. That means any message we add to this container will dissappear at times where the view
        // load takes longer than the messages check. So we wait for the selector to be available before writing to it.
        if (!tries) {
            tries = 1;
        }

        if (tries >= MAX_RETRIES) {
            return;
        }

        // wait for the dom element to exist...
        var $container = $('.main .container-fluid:first');
        if ($container.length <= 0) {
            setTimeout(function() {
                MessagesView.show(tries + 1);
            }, 500);
        } else {
            new MessagesView({
                container: $container
            });
        }
    };

    return MessagesView;
});