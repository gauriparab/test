/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'models/reportTemplateModel', 'hb!templates/assay/assay-report-template.html'].concat('jqSortable'),
        function($, _, Backbone, ReportTemplate, template) {
    "use strict";
            
    var AssayReportTemplateView = Backbone.View.extend({
        initialize: function(options) {
        	this.reportTemplate = new ReportTemplate({
        		id: options.id
        	});
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
        },
        
        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
        	var self = this;
			$.when(this.reportTemplate.fetch()).done(function(){
				self.$el.html(template(self.reportTemplate.toJSON()));
				$("#sortable1, #sortable2").sortable({
					connectWith : ".connected",
					items : "li:not(.disabled)"
				}).disableSelection();
			});
            return this;
        }

    });

    return AssayReportTemplateView;
});
