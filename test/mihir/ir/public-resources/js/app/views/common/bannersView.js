/*global define:false*/
define([ 'jquery', 'underscore', 'backbone', 'hb!templates/banner-message.html' ],
    function($, _, Backbone, template) {
        "use strict";
        var BannerView = Backbone.View.extend({

            /*
             * Anticipated options:
             *
             * id - The ID to be assigned to the Banner Div, any previous Div containing this ID will be removed.
             * container - the Selector or JQuery object to append the banner to
             * static - if we want the banner to persist and not automatically disappear.
             * delay - the # of milliseconds before the banner disappears.
             * sticky - (true|false) keep banner alive until a new banner is pushed.
             * style - the Bootstrap class to be applied on the banner; info, success, error
             *          any other values should provide warning-esque yellow alerts as that is default.
             * title - The i18n looked up title to display in the banner
             * titleKey - the Key to use to look up the title to be displayed
             * messages - an Array of message keys to look up and display.
             */
            initialize: function(options) {
                this.options = options || {};
                this.options.container = this.options.container || $(".main .container-fluid:first");
                this.options.delay = this.options.delay || 5000;
                if (this.options.sticky === true) {
                    this.options.stickyBannerStyle = 'banner-sticky-true';
                } else {
                    this.options.stickyBannerStyle = 'banner-sticky-false';
                }
                if (options.id && $("#" + options.id).length) {
                    this.clearBanner($("#" + options.id));
                }
		if(this.options.messages) {
		    if(!this.options.messages.categorize) {
                        this.options.messages = _.map(this.options.messages, function(message) {
                            if (_.isArray(message)) {
                                return {list: message};
                            } else {
                                return {single: message};
                            }
                        });
		    }
		}
            },

            render: function() {
                var self = this;
                self.clearBanner($('.banner-view').not('.banner-sticky-true'));
                var bannerTemplate = template(this.options);
                $(bannerTemplate).prependTo($(this.options.container));

                if (!this.options.static) {
                    setTimeout(function() {
                        self._clearBanner($('.banner-view').not('.banner-sticky-true'));
                    }, this.options.delay);
                }

                return this;
            },

            clearBanner: function($el) {
                ($el || $('.banner-view').not('.banner-sticky-true')).remove();
            },

            _clearBanner: function(banner$) {
                banner$.fadeOut({
                    complete: function() {
                        banner$.remove();
                    }
                });
            }
        });

        BannerView.show = function(options) {
            var view = new BannerView(options);
            return view.render();
        };

        /**
         * Clear Banners created by the Bannerview
         * @param el the selector or jQuery element indicating the banner to clear.
         *      if not specified it will clear all non-sticky banners that have been created by this view.
         */
        BannerView.clear = function(el) {
            el = el && $(el) || $('.banner-view').not('.banner-sticky-true');
            BannerView.prototype._clearBanner(el);
        };

        return BannerView;

    });
