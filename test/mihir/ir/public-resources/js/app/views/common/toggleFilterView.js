/*global define:false */
define(['jquery', 'underscore', 'backbone', 'hb!templates/common/toggle-filter.html'],
    function($, _, Backbone, template) {
        'use strict';

        /**
         * A toggle filter panel widget
         *
         * @type {*}
         */
        var ToggleFilterView = Backbone.View.extend({

            _template: template,

            events: {
                'click button': '_onFilterClick'
            },

            initialize: function(options) {
                options = options || {};
                this._filters = options.filters || [];
            },

            render: function() {
                this.$el
                    .addClass('btn-group')
                    .attr('data-toggle', 'buttons-radio')
                    .html(this._template({
                        filters: this._filters
                    }));
                this.setActive(0);
                return this;
            },

            getActive: function() {
                return this.$('.active').index();
            },

            setActive: function(index) {
                this.$('button:eq('+index+')').addClass('active').click();
            },

            _onFilterClick: function(e) {
                e.preventDefault();
                this.trigger('filter', $(e.currentTarget).data('filter'));
            }

        });

        return ToggleFilterView;
    }
);


