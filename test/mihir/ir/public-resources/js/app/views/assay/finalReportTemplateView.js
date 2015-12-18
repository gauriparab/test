/* global define:false*/
define([ 'jquery',
         'underscore',
         'backbone', 
         'views/assay/reportTemplatesGridView',
         'views/assay/reportTemplateDetailsView', 
         'views/common/baseModalView',
         'views/common/confirmModalView',
         'views/common/bannersView',
         'views/addNotesView',
         'views/viewNotes',
		'hb!templates/assay/final-report-template-view.html' ],

function($,
		 _, 
		 Backbone, 
		 ReportTemplatesGridView, 
		 ReportTemplateDetailsView, 
		 BaseModalView, 
		 Confirm,
		 BannerView,
		 AddNotesView,
	     ViewNotes,
		 template) {

	'use strict';

	var FinalReportTemplateView = Backbone.View.extend({

		_template : template,
		_gridEl : '#final-report-template-grid',

		initialize : function(options) {
			options = options || {};
			this.gridView = new ReportTemplatesGridView();
			this.gridView.on('action:view_details',this._viewDetails, this);
			this.gridView.on('action:obsolete',this._onObsolete, this);
			this.gridView.on('action:add-note', this._onAddNote, this);
            this.gridView.on('action:view-notes', this._viewNotes, this);
		},

		delegateEvents : function() {
			Backbone.View.prototype.delegateEvents.apply(this, arguments);
		},

		undelegateEvents : function() {
			Backbone.View.prototype.undelegateEvents.apply(this, arguments);
		},

		render : function() {
			this.$el.html(this._template);
			this.gridView.setElement(this.$(this._gridEl)).render();
		},
		
		_viewDetails : function(e, reportTemplate) {
			var self = this;
            BaseModalView.open(null, {
                el: "#viewReportTemplateDetails",
                reportTemplateId : reportTemplate.toJSON().id
            }, ReportTemplateDetailsView);
		},
		
		_onObsolete : function(e, reportTemplate) {
			var self = this;
			Confirm.open(function() {
					$.ajax({
						url : '/ir/secure/api/rdxReportTemplate/makeObesolute?templateId='+ reportTemplate.toJSON().id,
						type : 'GET',
						contentType : 'application/json',
						success : function() {
							new BannerView({
								id : 'change-state-success-banner',
								container : $('.main-content>.container-fluid'),
								style : 'success',
								title : $.t('reportTemplate.obsolete.success')
							}).render();
							self.gridView.refresh();
						}
					});
			},{
				headerKey : 'confirm.obsolete.reportTemplate.title',
				bodyKey : 'reportTemplate.obsolete.confirm'
			});
		},
		
		_onAddNote: function(e, model) {
            var self = this;
            BaseModalView.open(null, {
                el: "#addNotes",
                entityId: model.toJSON().id,
                entity: 'rdxReportTemplate',
                onComplete: function() {
                    self.onComplete('specimen.add.notes.success');
                }
            }, AddNotesView);
        },
        _viewNotes: function(e, model) {
            var self = this;
            BaseModalView.open(null, {
                el: "#viewNotes",
                entityId: model.toJSON().id,
                entity: 'rdxReportTemplate',
                url: '/ir/secure/api/rdxReportTemplate/notes?reportTemplateId=' + model.toJSON().id
            }, ViewNotes);
        },
        
        onComplete: function(messageKey) {
			 new BannerView({
	                container: $('.main-content').first(),
	                style: 'success',
	                titleKey: messageKey
	            }).render();
			 this.gridView.refresh();
		},
	});

	return FinalReportTemplateView;
});
