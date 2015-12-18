/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'hb!templates/filterChain/filter-chain-edit-filter-group.html'],
function($, _, Backbone, template) {
    "use strict";

    /**
     * View for editing a logical grouping of filters.
     */
    var FilterEditTypeLogicalFilterGroupView = Backbone.View.extend({

        views: null,

        initialize: function() {
            this.filter = this.options.filter;
            this.views = [];
        },

        render: function() {
            var self = this;
            this.$el.html(template({
                filter : this.filter
            }));
            this.filter.get('filters').each(function(filter) {
                var el = $('<div></div>').appendTo(self.$el),
                view = FilterEditTypeLogicalFilterGroupView.resolver.viewForType(filter.get('_type'));
                view = new view({
                    el: el,
                    filter: filter
                });
                view.render(true);
                self.views.push(view);
            });
            return this;
        },

        remove: function() {
            _.each(this.views, function(view) {
                view.remove();
            });
            this.views = [];
            Backbone.View.prototype.remove.apply(this);
        },

        prepareFilterForAdd: function() {
            this.filter.set('operator', this.$el.find('input[name=operator]:checked').val());
            _.each(this.views, function(v) {
                v.prepareFilterForAdd();
            });
        },

        isValidFilter: function() {

            // make sure at least one filter is enabled.
            var foundEnabled = _.some(this.views, function(v) {
                return v.isEnabled();
            });

            return foundEnabled && _.every(this.views, function(v) {
                return v.isValidFilter();
            });
        }
    });
    return FilterEditTypeLogicalFilterGroupView;
});