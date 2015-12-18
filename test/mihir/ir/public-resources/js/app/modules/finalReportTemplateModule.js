/*global define:false*/
define(['jquery', 'underscore', "views/finalReportTemplate/finalReportTemplateView", "models/finalReportTemplate", "collections/finalReportSectionCollection"]
    .concat(['bootstrap.modal', 'bootstrap.modalmanager']),
    function($, _, FinalReportTemplateView, FinalReportTemplate, FinalReportSectionCollection) {

    "use strict";

    var initialize = function(opts) {

        var options = opts || {};
        var sections = new FinalReportSectionCollection();
        var modalSelector = options.modalSelector || null;
        var model = null;
        
        if (options.action === 'CLONE') {
            model = options.model;
        } else {
            model = options.model ? new FinalReportTemplate({id: options.model.id}) : new FinalReportTemplate();
        }

        var launchDialog = function (sections) {
            new FinalReportTemplateView({
                el: modalSelector,
                model: model,
                defaultSections: sections, //the list of default sections for a FinalReportTemplate (should contain a unique list of all available sections)
                onComplete: options.onComplete,
                action: options.action,
                primaryButtonKey: 'button.save'
            }).render().$el.modal({
                width: (function() {
                    return ($(window).width() <= 1024) ? '92%' : '75%';
                }()),
                backdrop: 'static',
                attentionAnimation: null,
                keyboard: false,
                show : true,
                maxHeight : function() {
                    return $(window).height() - 200;
                }
            });
        };

        var fetchSections = function() {
            sections.fetch({success : launchDialog});
        };

        if (options.action !== 'CLONE' && options.model) {
            fetchFinalReportTemplate(model, fetchSections);
        } else {
            fetchSections();
        }

    };

    function fetchFinalReportTemplate(finalReportTemplate, onSuccess) {
        finalReportTemplate.fetch({success: function(model, response) {
            finalReportTemplate.set(response);
            onSuccess();
        }});
    }

    return {
        initialize: initialize
    };
});