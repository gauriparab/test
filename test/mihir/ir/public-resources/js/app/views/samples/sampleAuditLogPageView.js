/*global define:false*/
define([
    'jquery',
    'backbone',
    'views/samples/sampleInformationView',
    'views/samples/sampleAuditLogGridView',
    'hb!templates/sample/sample-audit-log-page.html'
], function(
    $,
    Backbone,
    SampleInformationView,
    SampleAuditLogGridView,
    template
) {
    'use strict';

    var SampleAuditLogPageView = Backbone.View.extend({

        _template: template,

        initialize: function() {
            this.sampleInformationView = new SampleInformationView({
                model: this.model
            });
            this.gridView = new SampleAuditLogGridView({
                model: this.model
            });
        },

        render: function() {
            this.$el.html(this._template(this.model.toJSON()));

            this.sampleInformationView.setElement(this.$("#sampleInformationPane")).render();
            this.gridView.setElement(this.$("#sampleAuditLogGridPane")).render();
        }
    });

    return SampleAuditLogPageView;
});