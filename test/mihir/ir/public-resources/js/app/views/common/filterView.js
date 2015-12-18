/*global define:false */
define(['jquery', 'underscore', 'backbone', 'hb!templates/common/filter.html'].concat('bootstrap.select'),
    function($, _, Backbone, defaultTemplate) {
        'use strict';

        /**
         * A filter panel widget
         *
         * @type {*}
         */
        var FilterView = Backbone.View.extend({

            template: defaultTemplate,

            _validOptions: ['url', 'filters', 'excludes', 'hasIcons', 'msgKeyPrefix', 'title'],

            initialize: function(options) {
                _.extend(this, _.defaults(
                    _.pick(options || {}, this._validOptions), {
                        url: null,
                        filters: [],
                        excludes: [],
                        hasIcons: false,
                        msgKeyPrefix: '',
                        title: ''
                    }
                ));

                if(options.template) {
                    this.template = options.template;
                }
            },

            render: function() {
                if (this.url) {
                    var that = this;
                    $.get(this.url, function(data) {
                        that.filters = data;
                        that._doRender.call(that);
                    });
                } else {
                    this._doRender();
                }
            },

            _doRender: function() {
                this.$el.html(this.template({
                    filters: _.without.apply(_, [].concat([this.filters], this.excludes)),
                    hasIcons: this.hasIcons,
                    msgKeyPrefix: this.msgKeyPrefix,
                    title: this.title
                }));
                this.$el.selectpicker();
                this.$el.on('change', _.bind(this._onFilterChanged, this));
            },

            _onFilterChanged: function(e) {
                this.trigger('filter', $(e.currentTarget).val());
            }

        });

        return FilterView;
    }
);
