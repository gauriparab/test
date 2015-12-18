/*global define:false*/
define(['backbone', 
        'collections/reportTemplates',
        'events/eventDispatcher',
        'hb!templates/common/select-dropdown-with-label.html'], 
    function(Backbone, 
        	ReportTemplates,
        	dispatcher,
        	template) {
	
    "use strict";
    var ReportTemplateView = Backbone.View.extend({
        initialize: function(options) {
        	this.collection = new ReportTemplates();
            this.listenTo(this.collection, 'sync', this.render);
            this.model = options.model || null;
            this.collection.fetch();
        },

        events: {
            'change select#reportTemplate': 'selectionChanged'
        },

        render: function() {
            this.$el.html(template({
                collection: this.collection.toJSON(),
                idKey: "reportTemplate",
                labelKey: "assay.summary.reportTemplate"
            }));
            if(this.model.getReportTemplate()){
            	$("#reportTemplate").val(this.model.getReportTemplate().id);
            	dispatcher.trigger('change:reportTemplate', this.model.getReportTemplate());
            } else{
            	var reportTemplate = this.collection.toJSON()[0];
            	if(reportTemplate){
            		this.model.setReportTemplate(reportTemplate);
            		dispatcher.trigger('change:reportTemplate', reportTemplate);
            	}
            }
            
            return this;
        },

        selectionChanged: function(e) {
            var value = $(e.currentTarget).val();
            this.model.setReportTemplate(this.collection.get(value).toJSON());            
            dispatcher.trigger('change:reportTemplate', this.model.getReportTemplate());
        }
    });

    return ReportTemplateView;
});
