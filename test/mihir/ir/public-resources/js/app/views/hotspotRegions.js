/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'hb!templates/workflow-hotspot-region.html'], function($, _, Backbone, template) {
	"use strict";
	var HotspotRegionsCollectionView = Backbone.View.extend({
		initialize: function() {
			this.listenTo(this.collection, 'sync', this.render);
			this.model = this.options.model || null;
		},

		events: {
			'change select#hotspots': 'selectionChanged'
		},

		render: function() {
			this.$el.html(template({
				regions: this.collection.toJSON()
			}));
			
			this.selected = this.model && this.model.getHotSpotRegion() || null;
			if(this.selected) {
				var _id = _.isString(this.selected.id) ? this.selected.id : this.selected.get("id");
				this.$el.find("select#hotspots").val(_id);
			} else {
				this.$el.find("select#hotspots").val('');
			}
			
			return this;
		},

		selectionChanged: function(e) {
			this.setSelected($(e.currentTarget).val());
		},

        setSelected: function(hotSpotRegion) {
            this.selected = this.collection.get(hotSpotRegion);
            this.model.setHotSpotRegion(this.selected);
            this.render();
        }
	});

	return HotspotRegionsCollectionView;
});