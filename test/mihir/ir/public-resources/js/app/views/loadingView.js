/*global define:false*/
define(['jquery', 'underscore', 'views/templateView', 'hb!templates/common/loading.html'].concat('bootstrap.modal', 'bootstrap.modalmanager'),
        function($, _, TemplateView, template) {
    'use strict';

    var LoadingView = TemplateView.extend({

        tagName: 'div',

        className: 'modal fade ir-loader',

        initialize: function(options) {
            options = options || {};
            this.titleKey = options.titleKey || 'loading.wait';
            this.bodyKey = options.bodyKey;

            this.$el.on('hidden', _.bind(this.remove, this));
        },

        render: function(options) {
            this.$el.html(template({
                titleKey: this.titleKey,
                bodyKey: this.bodyKey
            }));
            this.$el.modal(_.extend({
                width: 600,
                height: 150,
                backdrop: 'static',
                attentionAnimation: null,
                keyboard: false,
                show: true
            }, options));
            return this;
        },

        hide: function() {
            this.$el.modal('hide');
        }

    });
    return LoadingView;
});