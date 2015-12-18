/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'hb!templates/assay-annotation-select.html'],
    function($, _, Backbone, template) {
        "use strict";
        var AnnotationSetsCollectionView = Backbone.View.extend({
            initialize: function() {
                this.listenTo(this.collection, 'sync', this.render);
                this.model = this.options.model || null;
            },

            events: {
                'click .dropdown-menu li': 'selectionChanged'
            },

            render: function() {
                this.$el.html(template({
                    annotationSets: this.collection.toJSON(),
                    annotationSetsSize: this.collection.length
                }));
                this.selected = this.model.get("annotationSet");
                if (!this.selected) {
                    this.selected = this.collection.find(function(x) {
                        return x.get("factoryProvided");
                    });
                    this.model.setAnnotationSet(this.selected);
                }

                this.updateSelect(this.selected);

                this.$("#annotationSelect .dropdown-toggle").dropdown();

                return this;
            },

            selectionChanged: function(e) {
                var value = $(e.currentTarget).attr("id");
                this.selected = this.collection.get(value);
                this.model.setAnnotationSet(this.selected);
                this.updateSelect(this.selected);
            },

            updateSelect: function(selectedItem) {
                if (selectedItem) {
                    this.$el.find(".annotation-option").html(selectedItem.get("name"));
                }
            }
        });

        return AnnotationSetsCollectionView;
    });