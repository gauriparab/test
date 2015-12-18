/* global define:false */
define([ 'jquery',
         'underscore',
         'backbone',
         'views/common/iframeView'],
    function($,
             _,
             Backbone,
             IFrameView) {

        'use strict';

        var MetagenomicsResultView = Backbone.View.extend({

            /**
             * Constructor
             *
             * @param options
             */
            initialize: function() {
                this._iframeView = new IFrameView({
                    className: 'plugin-frame'
                });
            },

            /**
             * Render this view
             *
             * @returns {*}
             */
            render: function() {
                this.$el.html(this._iframeView.render().el);
                return this;
            },

            setLaunchURL: function(url) {
                this._iframeView.setURL(url);
                return this;
            }
        });

        return MetagenomicsResultView;
    }
);
