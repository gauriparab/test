/*global define:false */
define([
    'jquery',
    'underscore',
    'kendo',
    'views/templateView',
    'events/eventDispatcher',
    'hb!templates/analysis/analysis-summary.html',
    'hb!templates/analysis/plugin-popover-content.html',
    'hb!templates/analysis/specimen-group-popover-content.html'
], function(
    $,
    _,
    kendo,
    TemplateView,
    dispatcher,
    template,
    pluginPopoverTemplate,
    specimenGroupPopover) {

    'use strict';

    /**
     * A summary view of Analysis details
     *
     * @type {*}
     */
    var AnalysisSummaryView = TemplateView.extend({

        template: template,

        initialize: function () {
            this._invoice = null;
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(dispatcher, 'change:invoice', this._updateInvoice);
            this.on('render',this._onRender);
        },

        render: function() {
            var model = this._modelToJSON();
            this.$el.html(this.template(model));
            this.$("#selectedPlugins").popover({
                trigger: "hover",
                placement: "top",
                content: pluginPopoverTemplate(model),
                html: true
            });
            
            if(model.specimenCount > 0) {
                this.$("#specimenGroups").popover({
                    trigger: "hover",
                    placement: "top",
                    content: specimenGroupPopover(model),
                    html: true
                });
            }

            return this;
        },

        _onRender: function() {
            var summarySection = this.$(".summary-section");
            summarySection.affix({
                offset: {
                    top: summarySection.position().top
                }
            });
            summarySection.width(summarySection.width());
        },

        _modelToJSON: function() {
            var json = this.model.toJSON();
            var invoiceJson = null;
            if (this._invoice) {
                invoiceJson = this._invoice.toJSON();
                invoiceJson.invoiceTotal = invoiceJson.invoiceTotal &&
                    kendo.toString(kendo.parseFloat(invoiceJson.invoiceTotal, 'en-US'), 'c');
            }
            return _.defaults(_.extend(json, {
                specimenCount: json.specimenGroup ? json.specimenGroup.members.length : json.specimenGroups.length,
                invoice: invoiceJson
            }), {
                specimenCount: 0,
                invoice: null
            });
        },

        _updateInvoice: function(invoice) {
            this._invoice = invoice;
            this.render();
        }
    });

    return AnalysisSummaryView;
});
