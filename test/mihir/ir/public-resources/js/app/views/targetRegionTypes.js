/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'hb!templates/workflow-target-region-types.html'], function($, _, Backbone, template) {
    "use strict";
    var TargetRegionTypesCollectionView = Backbone.View.extend({
        initialize: function() {
            this.listenTo(this.collection, 'sync', this.render);
            this.model = this.options.model || null;
            this.url = '/ir/secure/api/v40/workflows/targetRegionTypes';
            this.msgKeyPrefix = 'targetRegionType.';
        },

        render: function() {
            var self = this;
            $.get(this.url, function(data) {
                    self.regions = data;
                    self.$el.html(template({
                        regions: self.regions,
                        msgKeyPrefix: self.msgKeyPrefix
                    }));
                });
                        
            return this;
        }
    });

    return TargetRegionTypesCollectionView;
});