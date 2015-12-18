/*global define:false*/
define(['jquery', 'underscore', 'backbone'],
    function($, _, Backbone) {
        "use strict";

        var doForAllSubviews = function(funcName) {
            //remove the functionName from the call to this function
            var args = Array.prototype.slice.call(arguments, 1);

            Backbone.View.prototype[funcName].apply(this, args);

            _.each(this._subViews, function(view) {
                view[funcName].apply(view, args);
            });
        };

        var ParentView = Backbone.View.extend({

            renderSubView: function(view, selector) {
                if (!this._subViews) {
                    this._subViews = [];
                }
                this._subViews.push(view);

                var $element = ( selector instanceof $ ) ? selector : this.$el.find(selector);
                view.setElement($element).render();
            },

            stopListening: _.partial(doForAllSubviews, 'stopListening'),

            undelegateEvents: _.partial(doForAllSubviews, 'undelegateEvents'),

            delegateEvents: _.partial(doForAllSubviews, 'delegateEvents')
        });

        return ParentView;
    });