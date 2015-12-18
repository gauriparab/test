/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'hb!templates/workflow-fusion-panel.html'],
    function($, _, Backbone, template) {
        "use strict";

        var FusionPanelsCollectionView = Backbone.View.extend({
            initialize: function() {
                this.listenTo(this.collection, 'sync', this.render);
                this.model = this.options.model || null;
            },

            events: {
                'change select#fusionPanel': 'selectionChanged'
            },

            render: function() {
                this.$el.html(template({
                    fusionPanels: this.collection.toJSON()
                }));

                this.selected = this.model && this.model.getFusionPanel() || null;
                if(this.selected) {
                    var _id = _.isString(this.selected.id) ? this.selected.id : this.selected.get("id");
                    this.$("select#fusionPanel").val(_id);
                } else {
                    this.$("select#fusionPanel").val('');
                }

                return this;
            },

            selectionChanged: function(e) {
                this.setSelected($(e.currentTarget).val());
            },

            setSelected: function(fusionPanel) {
                this.selected = this.collection.get(fusionPanel);
                this.model.setFusionPanel(this.selected);
                this.render();
            }
        });

        return FusionPanelsCollectionView;
    });