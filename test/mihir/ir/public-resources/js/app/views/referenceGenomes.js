/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'collections/referenceGenomes', 'hb!templates/workflow-reference-genome.html'], 
        function($, _, Backbone, ReferenceGenomesCollection, template) {
    "use strict";
    var ReferenceGenomeCollectionView = Backbone.View.extend({
        initialize: function() {
            this.listenTo(this.collection, 'sync', this.render);
            this.model = this.options.model || null;
        },

        events: {
            'change select#reference': 'selectionChanged'
        },

        render: function() {
            this.$el.html(template({
                references: this.collection.toJSON()
            }));

            this.selected = this.model && this.model.getReferences() || null;
            if (this.selected && this.selected.length > 0 && this.collection.length > 1) {
                this.$('select#reference')
                    .val(this.selected.map(function(item) {
                        return item.id;
                    }));
            }
            return this;
        },

        selectionChanged: function(e) {
            var values = $(e.currentTarget).val(),
                referenceGenomes = null;
            if (values && values.length > 0) {
                referenceGenomes = new ReferenceGenomesCollection();
                _.each(values, function(value) {
                    referenceGenomes.add(this.collection.get(value));
                }, this);
            }
            this.selected = referenceGenomes;
            this.model.setReferences(referenceGenomes);
        }
    });

    return ReferenceGenomeCollectionView;
});