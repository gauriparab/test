/*global define:false */
define(['jquery', 'underscore', 'backbone', 'hb!templates/common/search.html'],
    function($, _, Backbone, template) {
        'use strict';

        /**
         * A search widget
         *
         * @type {*}
         */
        var SearchView = Backbone.View.extend({

            template: template,

            events: {
                'click button[type=submit]': '_onSearch',
                'keyup input[type=text]': '_onKeyUp',
                'click button[type=reset]': '_onReset',
            },

            /**
             * Take the ID and validation regex as parameters
             *
             * @param options
             */
            initialize: function(options) {
                _.extend(this, _.pick(options || {}, ['template']));
            },

            render: function() {
                this.$el.html(this.template({
                	placeHolder: this.options.placeHolder
                }));
                this.$queryField = this.$('input[type=text]');
                return this;
            },

            /**
             * Fire a search event if the current query is valid
             *
             * @param e
             * @private
             */
            _onSearch: function(e) {
                e.preventDefault();
                var query = this.$queryField.val().trim();                
                this.trigger('search', query);   
                if (query !== "") {
	                this.$el.find('button[type=submit]').hide();
	                this.$el.find('button[type=reset]').show();
                }
            },

            /**
             * Highlight search box in red for invalid queries
             *
             */
            _onKeyUp: function() {
                var query = this.$queryField.val().trim();
                if (query == "") {
                    this.$('.control-group').removeClass('error');
                } else {
                    this.$('.control-group').addClass('error');
                }
            },

		    /**
		     * Clear search box
		     *
		     */
		    _onReset: function(e) {
	    		e.preventDefault();
                this.$queryField.val("");
                this.trigger('reset');
                this.$el.find('button[type=reset]').hide();
                this.$el.find('button[type=submit]').show();
		    }

        });

        return SearchView;
    }
);
