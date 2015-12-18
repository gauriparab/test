/*global define:false*/
define(['jquery',
        'underscore',
        'backbone',
        'views/common/confirmModalView',
        'views/common/confirmEULAModalView'],
    function ($,
              _,
              Backbone,
              ConfirmModalView,
              ConfirmEULAModalView) {

        'use strict';

        var EULAFile = Backbone.Model.extend({
            /**
             * Constructor
             *
             * @param attributes
             * @param options
             */
            initialize: function(attributes, options) {
                options = options || {};
                this._plugin = options.plugin;
                this._analysis = options.analysis;
            },

            /**
             * Model URL based on plugin ID
             *
             * @returns {string}
             */
            url: function() {
                return '/ir/secure/plugins/' + this._plugin.id + '/license';
            },

            /**
             * Customize AJAX options during fetch
             *
             * @param options
             */
            fetch: function(options) {
                options = options || {};
                return Backbone.Model.prototype.fetch.call(this, _.extend(options, {
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(this._analysis.toSlimJSON())
                }));
            },

            /**
             * Accept a license agreement. If no acceptance is required just call the
             * success callback, otherwise prompt user with license.
             *
             * @param success
             */
            accept: function(success, el) {
                var self = this;
                if (!this._isUserAcceptanceRequired()) {
                    // no acceptance required, just call success
                    success();
                } else {
                    // download license content then fire up confirmation dialog
                    this._download(function(data) {
                        ConfirmModalView.open(function() {
                            self._accept();
                            success();
                        }, {
                            el: el,
                            content: data
                        }, ConfirmEULAModalView);
                    });
                }
            },

            /**
             * Check if acceptance by user is required.
             *
             * @returns {boolean}
             * @private
             */
            _isUserAcceptanceRequired: function() {
                return this.get('_type') !== 'NoRequiredEULAFile';
            },

            /**
             * Download license content
             *
             * @param success call this callback on successful download
             * @private
             */
            _download: function(success) {
                $.ajax(_.extend(this._ajaxOptions(), {
                    url: this.url() + '/download',
                    success: _.bind(success, this)
                }));
            },

            /**
             * Inform the server of license acceptance
             *
             * @private
             */
            _accept: function() {
                $.ajax(_.extend(this._ajaxOptions(), {
                    url: this.url() + '/' + this.id + '/accept'
                }));
            },

            /**
             * Common custom AJAX options
             *
             * @returns {{type: string, contentType: string, data: *}}
             * @private
             */
            _ajaxOptions: function() {
                return {
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(this._analysis.toSlimJSON())
                };
            }
        });

        return EULAFile;
    }
);
