/*global define:false*/
define([ 'jquery', 'views/templateView', 'hb!templates/idleTimeout.html', 'bootstrap', 'idletimer' ], function ($, TemplateView, template) {
    "use strict";

    var PING_ENDPOINT = '/ir/secure/ping/',
        LOGOUT_ENDPOINT = '/ir/logout.html';

    var IdleTimeoutView = TemplateView.extend({

        id: 'idle-timeout-dialog',

        className: 'modal',

        attributes: {
            tabindex: -1,
            role: 'dialog'
        },

        template: template,

        events: {
            'click #btn-confirm': function(clickEvent) {
                clickEvent.preventDefault();
                this._resetIdleTimer();
                this.close();
            },

            'click #btn-cancel': function(clickEvent) {
                clickEvent.preventDefault();
                this._logout();
            }
        },

        /**
         * <p>
         * Set up event delegation.
         * </p>
         */
        initialize: function() {
            this.model.on('idle:idleTimeout', function() {
                this.show();
            }, this);
            this.model.on('logout:idleTimeout', function() {
                this._logout();
            }, this);
        },

        /**
         * <p>
         * Make sure view has been rendered and then start the auto logout timer.
         * </p>
         */
        show: function() {
            this.render().$el.appendTo(document.body);
            this.delegateEvents();
            this.$el.modal({
                backdrop: 'static',
                attentionAnimation: null,
                keyboard: false
            });
            this.model.startAutoLogoutTimer();
        },

        /**
         * <p>
         * Make sure auto logout timer is stopped and destroy this object.
         * </p>
         */
        close: function() {
            this.$el.modal('hide');
            this.remove();
            this.unbind();
            this.model.stopAutoLogoutTimer();
        },

        /**
         * <p>
         * Make an ajax call back to server's heartbeat controller. This will re-validate the server side session
         * and also trigger our idle counter to reset.
         * </p>
         *
         * @private
         */
        _resetIdleTimer: function() {
            $.get(PING_ENDPOINT);
        },

        /**
         * <p>
         * Handle logout by redirecting to our endpoint
         * </p>
         *
         * @private
         */
        _logout: function() {
            window.location = LOGOUT_ENDPOINT + '?status=idleLogout&type=INFO';
        }

    });

    return IdleTimeoutView;

});
