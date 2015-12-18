/*global define:false*/
define(['jquery', "views/annotationSetView", "models/annotationSet", "collections/annotationSourceCollection",
    "collections/annotationSourceTypeCollection"],
    function($, AnnotationSetView, AnnotationSet, AnnotationSourceCollection, AnnotationSourceTypeCollection) {

    "use strict";


    return {
        initialize: function(options) {

            options = options || {};

            var model = options.model ? new AnnotationSet({id : options.model.id }) : null;
            var sources = new AnnotationSourceCollection();
            var types = new AnnotationSourceTypeCollection();
            var modalSelector = options.modalSelector || null;
            types.fetch();
            sources.fetch();

            if (model) {
                model.fetch({success : launchDialog});
            } else {
                launchDialog(new AnnotationSet());
            }

            function launchDialog(model) {
                new AnnotationSetView({
                    el: modalSelector,
                    model : model,
                    collection : sources,
                    typeCollection : types,
                    action : options.action,
                    onComplete : options.onComplete
                }).render().$el.modal({
                    width: (function() {
                        return ($(window).width() <= 1024) ? '92%' : '75%';
                    }()),
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true,
                    height : (function() {
                        return $(window).height() - 100;
                    }()),
                    maxHeight : function() {
                        return $(window).height() - 200;
                    }
                });
            }
        }
	};
});