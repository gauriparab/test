/*global define:false*/
define([ 'jquery', 'backbone' ].concat('idletimer'), function($, Backbone) {
    "use strict";

    /**
     * <p>
     * Model for idle timeout functionality. This manages the timers and fires events.
     * </p>
     *
     * @type {*}
     */
    var IdleTimeout = Backbone.Model.extend({

        tId: null,

        defaults: {
            idleTimeoutDelay: 30 * 60 * 1000, // 30 minutes
            autoLogoutDelay: 60 * 1000, // 60 seconds
            autoLogout: true
        },

        initialize: function() {
            var self = this;

            $( document ).on( 'idle.idleTimer', function() {
                self.trigger('idle:idleTimeout');
            });

            $.idleTimer( this.get('idleTimeoutDelay') );
        },

        startAutoLogoutTimer: function() {
            var self = this;
            if (this.get('autoLogout')) {
                this.tId = setTimeout(function() {
                    self.trigger('logout:idleTimeout');
                }, this.get('autoLogoutDelay'));
            }
        },

        stopAutoLogoutTimer: function() {
            clearTimeout(this.tId);
        },

        destroy: function() {
            this.stopAutoLogoutTimer();
            $.idleTimer( 'destroy' );
        }

    });

    return IdleTimeout;
});