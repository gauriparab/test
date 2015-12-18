/*global define:false*/
/*jshint unused:false*/
define([ 'jquery', 'domready', 'views/idleTimeout', 'models/idleTimeout', 'models/configuration' ], function($, domReady, IdleTimeoutView, IdleTimeout, Configuration) {
    "use strict";

    /**
     * <p>
     * Create an idle timeout view with model. Use configuration values pulled from server for model.
     * </p>
     */
    var initialize = function() {
        domReady(function() {
            var view = new IdleTimeoutView({
                model: new IdleTimeout({
                    idleTimeoutDelay: parseInt(Configuration.get('idleTimeoutDelay'), 10),
                    autoLogoutDelay: parseInt(Configuration.get('autoLogoutDelay'), 10)
                })
            });
        });
    };

    return {
        initialize: initialize
    };

});