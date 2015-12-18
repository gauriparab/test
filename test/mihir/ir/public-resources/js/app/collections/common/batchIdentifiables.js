/*global define:false*/
define(['jquery',
        'underscore',
        'backbone',
        'models/batchresult/BatchResult'],

    function(
        $,
        _,
        Backbone,
        BatchResult) {

        'use strict';

        /**
         * Backbone model of a set of Specimen
         *
         * @type {*}
         */
        var BatchIdentifiables = Backbone.Collection.extend({

            getActions: function(done) {
                return $.ajax({
                    url: _.result(this, 'url') + '/actions',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(this.toJSON())
                }).done(done);
            },

            destroy: function() {
                var self = this;
                return $.ajax({
                    url: _.result(this, 'url'),
                    type: 'DELETE',
                    contentType: 'application/json',
                    data: JSON.stringify(this.toJSON()),
                    success: function(response) {
                        var batchResult = new BatchResult(response, { itemModel: self.model });
                        batchResult.getSuccessfulResults().each(function(result) {
                            self.remove(self.get(result.get('item').id));
                        });
                    }
                });
            }
        });

        return BatchIdentifiables;

    }
);
