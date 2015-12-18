/*global define:false*/
define([ 'jquery', 'underscore', 'backbone', 'collections/BaseCollection', 'models/customDesignPanel' ], 
        function($, _, Backbone, BaseCollection, CustomDesignPanel) {

    'use strict';

    var CustomDesignPanelsCollection = BaseCollection.extend({
        model : CustomDesignPanel,
        url: '/ir/secure/api/v40/customDesignPanels',

        initialize: function() {
            this.username = '';
            this.password = '';
        },

        fetch: function(customOptions) {
            var options = _.extend({}, {
                data: JSON.stringify({
                    username: this.username,
                    password: this.password
                }),
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json'
            }, customOptions);

            return BaseCollection.prototype.fetch.call(this, options);
        }
    });

    return CustomDesignPanelsCollection;
});