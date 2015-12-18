/*global define:false */
define([
    'jquery',
    'underscore',
    'backbone',
    'hb!templates/common/batch-result-item.html'
], function(
    $,
    _,
    Backbone,
    template) {

    'use strict';

    /**
     * A common view for each item of a batch result operation.
     *
     * @type {*}
     */
    var BatchItemResultView = Backbone.View.extend({

        initialize: function() {
            Backbone.View.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            this.$el.html(template(this.model && _.extend(this.model.toJSON(), {
                success: this.model.isSuccess(),
                errorMsgs: this.model.hasError() &&
                    ((this.model.get('error').isSingle() && [this.model.get('error').getMessage()]) ||
                    (!this.model.get('error').isSingle() && this.model.get('error').getMessage()))
            })));
            return this;
        },

        setResult: function(result) {
            this.model = result;
            return this;
        }

    });

    return BatchItemResultView;

});
