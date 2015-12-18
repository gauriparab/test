/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'hb!templates/annotation-set-source-types.html'],
        function($, _, Backbone, template) {

    "use strict";

    var AnnotationSetSourceTypesView = Backbone.View.extend({

        initialize: function() {

            this.types = this.collection || null;
            this.listenTo(this.types, 'sync', this.render);

        },

        events: {
            'change select#types': 'selectionChanged'
        },

        render: function() {

            this.$el.html(template({
                types: _.sortBy(this.collection.toJSON(), function(item) {return $.t('annotation.source.type.' + item.name).toLowerCase();})
            }));


            var selectedId = this.types.selected.id;
            if (selectedId) {
                this.$el.find('select#types').val(selectedId);
            } else {
                this.$el.find('select#types').val('');
            }

            return this;
        },

        selectionChanged: function(e) {
            e.preventDefault();
            var value = $(e.currentTarget).val();

            // setting the attributes is necessary so we can "listenTo" this instance of selected.
            var selectedType = this.types.get(value);
            if (selectedType && selectedType.attributes) {
                this.types.selected.set(selectedType.attributes);
            }
        }
    });

    return AnnotationSetSourceTypesView;
});