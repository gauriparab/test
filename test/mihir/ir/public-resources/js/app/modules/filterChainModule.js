/*global define:false*/
define(['jquery', 'underscore', "views/filterChains/filterChainView", "models/filterChain", "collections/filterCollection"]
    .concat(['bootstrap.modal', 'bootstrap.modalmanager']),
    function($, _, FilterChainView, FilterChain, FilterCollection) {

    "use strict";

    var initialize = function(opts) {

        var options = opts || {};
        var filters = new FilterCollection();
        var modalSelector = options.modalSelector || null;
        var model = options.model ? new FilterChain({id: options.model.id}) : new FilterChain();

        var launchDialog = function (filters) {
            new FilterChainView({
                el: modalSelector,
                model: model,
                collection: filters,
                onComplete: options.onComplete,
                action: options.action,
                primaryButtonKey: 'button.save'
            }).render().$el.modal({
                width: (function() {
                    return ($(window).width() <= 1024) ? '92%' : '75%';
                }()),
                modalOverflow: true,
                backdrop: 'static',
                attentionAnimation: null,
                keyboard: false,
                show : true,
                maxHeight : function() {
                    return $(window).height() - 50;
                }
            });
        };

        var fetchFilters = function() {
            filters.fetch({success : launchDialog});
        };

        if (options.model) {
            fetchFilterChain(model, fetchFilters);
        } else {
            fetchFilters();
        }

    };

    function fetchFilterChain(filterChain, onSuccess) {
        filterChain.fetch({success: function(model, response) {
            filterChain.set(response);
            onSuccess();
        }});
    }

    return {
        initialize: initialize
    };
});