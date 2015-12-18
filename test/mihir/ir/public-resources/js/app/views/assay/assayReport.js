/*global define:false*/
define(['jquery', 'underscore', 'views/ParentView', 'collections/reportTemplates', 'views/assay/assayReportTemplateView', 'views/common/bannersView', 'hb!templates/assay/assay-report.html'].concat('jqSortable'),
        function($, _, ParentView, ReportTemplates, ReportTemplateView, BannerView, template) {
    "use strict";
            
    var AssayReportView = ParentView.extend({
        initialize: function() {
        	this.reportTemplates = new ReportTemplates();
        },
        
        events : {
        	'change #selectedReport' : 'selectionChanged'
        },

        delegateEvents: function() {
            ParentView.prototype.delegateEvents.apply(this, arguments);
        },
        
        undelegateEvents: function() {
            ParentView.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
        	var self = this;
			$.when(this.reportTemplates.fetch()).done(function(){
				self.$el.html(template({
					reportTemplates: self.reportTemplates.toJSON()
				}));	
				self.renderReportTemplate(self.reportTemplates.toJSON()[0].id);
				self.model.setReportTemplate(self.reportTemplates.toJSON()[0]);
			});
            return this;
        },
        
        selectionChanged: function(e) {
        	this.renderReportTemplate(e.target.value);
        },
        
        renderReportTemplate: function(reportId) {
        	this.reportTemplateView = new ReportTemplateView({
        		id: reportId
        	});
        	this.renderSubView(this.reportTemplateView, "#reporttempalteForm");	
        }
    });

    return AssayReportView;
});
