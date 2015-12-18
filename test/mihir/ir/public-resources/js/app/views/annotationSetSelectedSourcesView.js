/*global define:false*/
define(['underscore', 'jquery', 'backbone', 'hb!templates/annotation-set-selected-sources.html', 
    'views/annotationSetSelectedSourceRowView'],

function(_, $, Backbone, template, RowView) {

    "use strict";

    var AnnotationSetSelectedSourcesView = Backbone.View.extend({

        initialize: function() {
            var self = this;
            this.annotationSet = this.model || null;
            this.listenTo(this.annotationSet.get("sources"), 'add', this.add);
            this.listenTo(this.annotationSet.get("sources"), 'remove', this.remove);

            this.rowViews = [];
            var selectedSources = this.annotationSet.get("sources");
            selectedSources.each(function(selectedSource) {
                var rowView = new RowView({
                    model: selectedSource
                });
                self.rowViews.push(rowView);
            });

        },

        render: function() {
            var self = this;

            this.$el.html(template());

            _.each(this.rowViews, function(subView) {
                self.$("#selected-sources-table").append(subView.render().$el);
            });
            return this;
        },

        add: function(source) {
            var rowView = new RowView({
                model: source
            });
            this.rowViews.push(rowView);
            this.$("#selected-sources-table").append(rowView.render().$el);
        },

        remove: function(source) {
            var index = -1,
                view = _.find(this.rowViews, function(view, i) {
                    index = i;
                    return view.model.cid === source.cid;
                });
            if (view) {
                this.rowViews.splice(index, 1);
                view.remove();
            }
        }

    });

    return AnnotationSetSelectedSourcesView;
});