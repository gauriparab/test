/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'events/eventDispatcher', 'hb!templates/workflow-target-region.html'],
    function($, _, Backbone, dispatcher, template) {
	"use strict";
	var TargetRegionsCollectionView = Backbone.View.extend({
		initialize: function() {
			this.listenTo(this.collection, 'sync', this.render);
			this.listenTo(this.collection, 'add', this.render);
			this.model = this.options.model || null;
		},

		events: {
			'change select#regions': 'selectionChanged'
		},

		render: function() {
			this.$el.html(template({
				regions: this.collection.toJSON()
			}));

			this.selected = this.model && this.model.get('targetRegion') || null;
			if(this.selected) {
				var _id = _.isString(this.selected.id) ? this.selected.id : this.selected.get("id");
				this.$el.find('select#regions').val(_id);
			} else {
				this.$el.find('select#regions').val('');
			}

			return this;
		},

		selectionChanged: function(e) {
			this.setSelected($(e.currentTarget).val());
			dispatcher.trigger('targetRegions:selectionChanged');
		},

        setSelected: function(targetRegion) {
            this.selected = this.collection.get(targetRegion);
            this.model.set('targetRegionConfigurationChoice', null);
            this.model.set('targetRegion', this.selected);
            this.render();
        }

	});

	return TargetRegionsCollectionView;
});